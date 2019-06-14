import { SelectorCall, ParamCache, ParamMap } from "./interfaces";
import { paramMap, NOT_EXIST } from "./structures/paramMap";

interface SelectorCallNode {
	call: SelectorCall;
	value: any;
	dependents: Map<SelectorCallNode, boolean>;
	dependencies: Map<SelectorCallNode, boolean>;
	invalidatedDepencyCount: number;
	run: () => any;
	isValid: boolean;
}

function highlightDependencyRoute(nodes: SelectorCallNode[]) {
	const visited = new Set();
	const stack = [...nodes];

	while (stack.length) {
		const current = stack.pop()!;
		visited.add(current);

		for (const [dependent, vertexValue] of current.dependents) {
			if (vertexValue === false) throw "cyclic dependency";

			dependent.dependencies.set(current, false);
			if (visited.has(dependent) === false) {
				stack.unshift(dependent);
				visited.add(dependent);
			}
		}
	}
}


export function invalidateNodes(nodes: SelectorCallNode[]) {
	highlightDependencyRoute(nodes);
	nodes.forEach(p => p.isValid = false);

	const stack = [...nodes];

	while (stack.length) {
		const current = stack.pop()!;

		let invalidateParent;

		if (!current.isValid) {
			const newValue = current.run();
			invalidateParent = newValue !== current.value;
			current.isValid = true;
			current.value = newValue;
		}

		for (const [parent, vertex] of current.dependents) {
			parent.isValid = !invalidateParent;

			let shouldPushToStack = true;
			parent.dependencies.set(current, true);
			for (const [child, v] of parent.dependencies) {
				if (v === false) {
					shouldPushToStack = false;
					break;
				}
			}
			if (shouldPushToStack) {
				stack.unshift(parent);
			}
		}
	}

}


function selectorStore() {
	const selectorCacheMap: Map<number, ParamMap<SelectorCallNode>> = new Map();
	const selectorCallNodeMap: Set<SelectorCallNode> = new Set();

	return {
		createSelectorCallState(id: number, params: any[], run: () => any): SelectorCallNode {
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
				}

				selectorCacheMap.get(id)!.set(params, node);
				selectorCallNodeMap.add(node);
			}

			return node;
		},
		getSelectorCallState(id: number, params: any[]): SelectorCallNode | undefined {
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