import { Store } from 'redux';
import { reduxsPathInitializeActionType } from './constants';
import { SelectorWatcher, Dictionary } from './interfaces';
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
let watcherQueue: SelectorWatcher[];
let updatedPaths: Dictionary<boolean> = {};

function resetVariables() {
    store = undefined!;
    state = undefined;
    watcherQueue = [];
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
    const currentWatcher = watcherQueue[watcherQueue.length - 1];

    if (currentWatcher) {
        watcherStore.addWatcherDependency(currentWatcher, watcher, params);
    }
}

function registerSelectorPropWatcher(watcher: SelectorWatcher, params: any[]) {
    const currentWatcher = watcherQueue[watcherQueue.length - 1];

    watcherQueue.push(watcher);

    if (currentWatcher) {
        watcherStore.addWatcherDependency(currentWatcher, watcher, params);
    }
}

function unregisterSelectorPropWatcher(watcher: SelectorWatcher) {
    watcherQueue.pop();
}

function onPathRead(path: string) {
    const activeWatcher = watcherQueue[watcherQueue.length - 1];

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