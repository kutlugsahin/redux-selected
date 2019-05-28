import { Store } from 'redux';
import { reduxsPathInitializeActionType } from './constants';
import { Watcher } from './interfaces';
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
let watcherQueue: Watcher[];

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
    watcherStore.notifyWatcherForPath(path);
}

function onSelectorCacheReturn(watcher: Watcher) {
    const currentWatcher = watcherQueue[watcherQueue.length - 1];

    if (currentWatcher) {
        watcherStore.addWatcherDependency(currentWatcher, watcher);
    }
}

function registerSelectorPropWatcher(watcher: Watcher) {
    const currentWatcher = watcherQueue[watcherQueue.length - 1];

    watcherStore.clearDependencies(watcher);

    watcherQueue.push(watcher);

    if (currentWatcher) {
        watcherStore.addWatcherDependency(currentWatcher, watcher);
    }
}

function unregisterSelectorPropWatcher(watcher: Watcher) {
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

export default (reduxStore: Store) => {
    const replacer = reduxStore.replaceReducer;

    reduxStore.replaceReducer = (...params) => {
        setupStore(reduxStore);
        return replacer(...params);
    };

    setupStore(reduxStore);
    return reduxStore;
};
