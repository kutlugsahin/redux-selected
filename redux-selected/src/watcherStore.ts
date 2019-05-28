import { dependency } from './dependency';
import { Watcher } from './interfaces';

export function createWatcherStore() {
    const reducerWatchers = new Map<string, Map<number, Watcher>>();
    const watcherReducers = new Map<number, Map<string, boolean>>();
    const watchers = new Map<number, Watcher>();
    const dependencies = dependency();

    function addReducerDependency(watcher: Watcher, path: string) {
        if (!reducerWatchers.get(path)) {
            reducerWatchers.set(path, new Map());
        }

        const id = watcher.id;

        watchers.set(id, watcher);
        reducerWatchers.get(path)!.set(id, watcher);

        if (!watcherReducers.get(id)) {
            watcherReducers.set(id, new Map());
        }

        watcherReducers.get(id)!.set(path, true);
    }

    function addWatcherDependency(dependentWatcher: Watcher, dependencyWatcher: Watcher) {
        watchers.set(dependentWatcher.id, dependentWatcher);
        watchers.set(dependencyWatcher.id, dependencyWatcher);
        dependencies.addDependency(dependentWatcher, dependencyWatcher);
    }

    function clearDependencies(watcher: Watcher) {
        dependencies.clearDependencies(watcher.id);

        const pathMap = watcherReducers.get(watcher.id);

        if (pathMap) {
            for (const path of pathMap.keys()) {
                const watcherMap = reducerWatchers.get(path);
                if (watcherMap) {
                    watcherMap.delete(watcher.id);
                }
            }
        }
    }

    // function getWatchersOfPath(path: string) {
    //     const watchersOfPath = reducerWatchers.get(path);
    //     return watchersOfPath ? watchersOfPath.values() : [];
    // }

    function getWatcherDependencies(id: number) {
        return dependencies.getDependents(id).map((key) => watchers.get(key));
    }

    function notifyWatcherForPath(path: string) {
        function notifyWatcher(id: number) {
            const watcher = watchers.get(id);
            if (watcher!.notify()) {
                dependencies.getDependents(id).forEach(notifyWatcher);
            }
        }

        const pathWatchers = reducerWatchers.get(path);
        if (pathWatchers) {
            for (const watcher of pathWatchers.values()) {
                notifyWatcher(watcher.id);
            }
        }
    }

    function getAll() {
        return watchers.values();
    }

    function invalidateAll() {
        for (const watcher of watchers.values()) {
            watcher.notify();
        }
    }

    return {
        getAll,
        invalidateAll,
        addReducerDependency,
        addWatcherDependency,
        // getWatchersOfPath,
        getWatcherDependencies,
        notifyWatcherForPath,
        clearDependencies,
    };
}
