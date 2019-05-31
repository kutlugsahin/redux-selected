import { Watcher } from './interfaces';

interface Dependent {
    id: number;
    paramsArr: any[][];
}

export function dependency() {
    const dependencies = new Map<number, Map<number, any[][]>>();
    const reverseDependencies = new Map<number, Map<number, any[][]>>();

    function addDependency(dependentWatcher: Watcher, dependencyWatcher: Watcher, params: any[] = []) {
        const dependentId = dependentWatcher.id;
        const dependencyId = dependencyWatcher.id;

        if (dependencies.get(dependentId) === undefined) {
            dependencies.set(dependentId, new Map());
        }

        if (dependencies.get(dependentId)!.get(dependencyId) === undefined) {
            dependencies.get(dependentId)!.set(dependencyId, []);
        }

        dependencies.get(dependentId)!.get(dependencyId)!.push(params);

        if (reverseDependencies.get(dependencyId) === undefined) {
            reverseDependencies.set(dependencyId, new Map());
        }

        if (reverseDependencies.get(dependencyId)!.get(dependentId) === undefined) {
            reverseDependencies.get(dependencyId)!.set(dependentId, []);
        }

        reverseDependencies.get(dependencyId)!.get(dependentId)!.push(params);
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

    function getDependents(id: number): Dependent[] {
        const map = reverseDependencies.get(id);
        if (map) {
            const result:Dependent[] = [];
            for (const [key, value] of map) {
                result.push({
                    id: key,
                    paramsArr: value
                });
            }

            return result;
        }

        return [];
    }

    return {
        addDependency,
        clearDependencies,
        getDependents,
    };
}
