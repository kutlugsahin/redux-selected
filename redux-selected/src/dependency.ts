import { Watcher } from './interfaces';

export function dependency() {
    const dependencies = new Map<number, Map<number, boolean>>();
    const reverseDependencies = new Map<number, Map<number, boolean>>();

    function addDependency(dependentWatcher: Watcher, dependencyWatcher: Watcher) {
        const dependentId = dependentWatcher.id;
        const dependencyId = dependencyWatcher.id;

        if (dependencies.get(dependentId) === undefined) {
            dependencies.set(dependentId, new Map());
        }
        dependencies.get(dependentId)!.set(dependencyId, true);

        if (reverseDependencies.get(dependencyId) === undefined) {
            reverseDependencies.set(dependencyId, new Map());
        }
        reverseDependencies.get(dependencyId)!.set(dependentId, true);
    }

    function clearDependencies(id: number) {
        const dependencyWatchers = dependencies.get(id);

        if (dependencyWatchers) {
            const dependencyWatcherIds = dependencyWatchers.keys();

            for (const wId of dependencyWatcherIds) {
                const map = reverseDependencies.get(wId)!;
                map.delete(id);
            }

            dependencies.set(id, new Map());
        }
    }

    function getDependents(id: number) {
        const map = reverseDependencies.get(id);
        return map ? [...map.keys()] : [];
    }

    return {
        addDependency,
        clearDependencies,
        getDependents,
    };
}
