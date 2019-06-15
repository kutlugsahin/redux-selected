import { SelectorCallState, ParamMap } from "./interfaces";
import { paramMap, NOT_EXIST } from "./structures/paramMap";

function store() {
	const selectorCacheMap: Map<number, ParamMap<SelectorCallState>> = new Map();
	const selectorCallNodeMap: Set<SelectorCallState> = new Set();

	return {
		createSelectorCallState(id: number, params: any[], run: () => any): SelectorCallState {
			let selectorParamCache = selectorCacheMap.get(id);

			if (!selectorParamCache) {
				selectorParamCache = paramMap();
				selectorCacheMap.set(id, selectorParamCache);
			}

			let node = selectorCacheMap.get(id)!.get(params);

			if (!node) {
				node = {
					call: {
						selectorId: id,
						params,
					},
					dependencies: new Map(),
					dependents: new Map(),
					isValid: true,
					run,
					value: NOT_EXIST,
					invalidDependencyCount: 0,
				}

				selectorCacheMap.get(id)!.set(params, node);
				selectorCallNodeMap.add(node);
			}

			return node;
		},
		getSelectorCallState(id: number, params: any[]): SelectorCallState | undefined {
			let selectorParamCache = selectorCacheMap.get(id);

			if (!selectorParamCache) {
				selectorParamCache = paramMap();
				selectorCacheMap.set(id, selectorParamCache);
			}

			return selectorCacheMap.get(id)!.get(params);
		},
		removeSelectorCallState(id: number, params: any[]): void {
			let selectorParamCache = selectorCacheMap.get(id);

			if (!selectorParamCache) {
				const node = selectorCacheMap.get(id)!.remove(params);
				if (node) {
					selectorCallNodeMap.delete(node);
				}
			}

		}
	}
}

export const selectorStore = store();