import { dependency } from './dependency';
import { SelectorWatcher, ParamCache } from './interfaces';

export function createWatcherStore() {
    const reducerWatchers = new Map<string, Map<number, SelectorWatcher>>();
    const watcherReducers = new Map<number, Map<string, boolean>>();
    const watchers = new Map<number, SelectorWatcher>();
    const dependencies = dependency();

    function addReducerDependency(watcher: SelectorWatcher, path: string) {
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

    function addWatcherDependency(dependentWatcher: SelectorWatcher, dependencyWatcher: SelectorWatcher, params: any[]) {
        watchers.set(dependentWatcher.id, dependentWatcher);
        watchers.set(dependencyWatcher.id, dependencyWatcher);
        dependencies.addDependency(dependentWatcher, dependencyWatcher, params);
    }

    function clearDependencies(watcher: SelectorWatcher) {
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

    function notifyWatcherForPaths(paths: string[]) {
        const rootWatchersMap = paths.reduce((acc: any, path) => {
            for (const [id, watcher] of (reducerWatchers.get(path) || [])) {
                acc[id] = watcher;
            }
            return acc;
        }, {});

        const watcherQueue: SelectorWatcher[] = Object.keys(rootWatchersMap).map(p => rootWatchersMap[p]);
        const prevParamCacheMap = new Map<number, ParamCache>();

        while (watcherQueue.length > 0) {
            const watcher = watcherQueue.pop()!;
            if (!prevParamCacheMap.get(watcher.id)) {
                prevParamCacheMap.set(watcher.id, watcher.getCache());
                watcher.notify();

                const dependents = dependencies.getDependents(watcher.id);

                for (const dependent of dependents) {
                    if (dependent.paramsArr.some(params => prevParamCacheMap.get(watcher.id)!.get(params) !== watcher.run(params))) {
                        watcherQueue.unshift(watchers.get(dependent.id)!);
                    }
                }
            }
        }
    }

    function invalidateAll() {
        for (const watcher of watchers.values()) {
            watcher.notify();
        }
    }

    return {
        invalidateAll,
        addReducerDependency,
        addWatcherDependency,
        notifyWatcherForPaths,
        clearDependencies,
    };
}
