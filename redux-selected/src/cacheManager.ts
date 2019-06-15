import { SelectorCallState } from "./interfaces";

function highlightDependencyRoute(nodes: SelectorCallState[]) {
	const visited = new Set();
	const stack = [...nodes];

	while (stack.length) {
		const current = stack.pop()!;
		visited.add(current);

		for (const [dependent, vertexValue] of current.dependents) {
			if (vertexValue === false) {
				console.error('Cyclic Dependency in selectors');
				throw "cyclic dependency"
			};

			dependent.invalidDependencyCount++;
			if (visited.has(dependent) === false) {
				stack.unshift(dependent);
				visited.add(dependent);
			}
		}
	}
}


export function invalidateNodes(nodes: SelectorCallState[]) {
	highlightDependencyRoute(nodes);
	nodes.forEach(p => p.isValid = false);

	const stack = [...nodes];

	while (stack.length) {
		const current = stack.pop()!;

		if (current.invalidDependencyCount === 0) {
			let invalidateParent;

			if (current.isValid === false) {
				const newValue = current.run();
				invalidateParent = newValue !== current.value;
				current.isValid = true;
				current.value = newValue;
			}

			for (const [parent] of current.dependents) {
				parent.isValid = !invalidateParent;
				parent.invalidDependencyCount--;
				
				if (parent.invalidDependencyCount === 0) {
					stack.unshift(parent);
				}
			}
		}
	}
}

