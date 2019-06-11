import { Store } from 'redux';
import { reduxsPathInitializeActionType } from './constants';
import { SelectorWatcher, Dictionary, SelectorCall } from './interfaces';
import { createWatcherStore } from './watcherStore';

function get(obj: any, path: string[]) {
    let current = obj;
    let pathIndex = 0;

    while (current !== undefined && pathIndex < path.length) {
        current = current[path[pathIndex]];
        pathIndex++;
    }

    return current;
}

let store: Store;
let state: any;
let reducers: Map<string, boolean>;
let watcherStore: ReturnType<typeof createWatcherStore>;
let selectorCallQueue: SelectorCall[];
let updatedPaths: Dictionary<boolean> = {};

function resetVariables() {
    store = undefined!;
    state = undefined;
    selectorCallQueue = [];
    reducers = new Map<string, boolean>();
    if (watcherStore) {
        watcherStore.invalidateAll();
    }
    watcherStore = createWatcherStore();
}

function addReducerPath(path: string) {
    reducers.set(path, true);
}

function onReducerStateChanged(path: string) {
    updatedPaths[path] = true;
}

function onStoreUpdated() {
    const paths = Object.keys(updatedPaths);
    updatedPaths = {};
    watcherStore.notifyWatcherForPaths(paths);
}

function onSelectorCacheReturn(watcher: SelectorWatcher, params: any[]) {
    const currentSelecterCall = selectorCallQueue[selectorCallQueue.length - 1];

    if (currentSelecterCall) {
        watcherStore.addWatcherDependency(currentSelecterCall, watcher, params);
    }
}

function registerSelectorPropWatcher(watcher: SelectorWatcher, params: any[]) {
    const currentWatcher = selectorCallQueue[selectorCallQueue.length - 1];

    selectorCallQueue.push({
        watcher,
        params,
    });

    if (currentWatcher) {
        watcherStore.addWatcherDependency(currentWatcher, watcher, params);
    }
}

function unregisterSelectorPropWatcher(watcher: SelectorWatcher) {
    selectorCallQueue.pop();
}

function onPathRead(path: string) {
    const activeWatcher = selectorCallQueue[selectorCallQueue.length - 1];

    if (activeWatcher) {
        watcherStore.addReducerDependency(activeWatcher, path);
    }
}

function setupStore(reduxStore: Store) {
    resetVariables();
    store = reduxStore;
    store.dispatch({
        type: reduxsPathInitializeActionType,
        payload: {
            path: [],
        },
    });

    store.subscribe(onStoreUpdated);
}

function getState() {
    if (!state) {
        state = createStateProxy(store.getState(), onPathRead);
    }
    return state;
}

function createStateProxy(reduxState: any, pathReadCallback: (path: string) => void, path: string[] = []) {
    return Object.keys(reduxState).reduce((acc: any, key: string) => {

        const currentPath = [...path, key];
        const currentPathString = currentPath.join('.');

        if (reducers.get(currentPathString)) {
            Object.defineProperty(acc, key, {
                get: () => {
                    pathReadCallback(currentPathString);
                    return get(store.getState(), currentPath);
                },
            });
        } else if (typeof reduxState === 'object') {
            acc[key] = createStateProxy(reduxState[key], pathReadCallback, currentPath);
        }

        return acc;
    }, {});
}

export {
    addReducerPath,
    onReducerStateChanged,
    registerSelectorPropWatcher,
    unregisterSelectorPropWatcher,
    createStateProxy,
    getState,
    onSelectorCacheReturn,
    setupStore,
};