import { SelectorCall, ParamCache } from "./interfaces";

interface SelectorCallNode {
	call: SelectorCall;
	value: any;
	dependents: Map<SelectorCallNode, boolean>;
	dependencies: Map<SelectorCallNode, boolean>;
	run: () => any;
	isValid: boolean;
}

const selectorCacheMap: Map<number, ParamCache<SelectorCallNode>> = new Map();


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


function invalidateNodes(nodes: SelectorCallNode[]) {
	highlightDependencyRoute(nodes);

	const stack = [...nodes];

	while (stack.length) {
		const current = stack.pop()!;

		// if has false dependency then it means will be reached later by another node
		// otherwise recalculate node value
		// set dependents dependency connection to true
		// push dependents to stack if they are not there yet
		
	}
}