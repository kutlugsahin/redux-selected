import { Node, node, QueueStack } from "./shared";

export function stack<T>(): QueueStack<T> {
	let last: Node<T> | undefined;
	let size = 0;

	function push(val: T): void {
		const n = node(val, last, undefined);
		last = n;
		size++;
	}

	function pop(): T | undefined {
		if (last) {
			const n = last;
			last = n.prev;
			n.prev = undefined;
			size--;
			return n.value;
		}

		return undefined;
	}

	return {
		push,
		pop,
		size: () => size
	};
}