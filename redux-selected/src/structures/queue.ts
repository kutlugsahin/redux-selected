import { Node, node, QueueStack } from "./shared";

export function queue<T>(): QueueStack<T> {
	let first: Node<T> | undefined;
	let last: Node<T> | undefined;
	let size = 0;

	function push(val: T): void {
		const n = node(val, undefined, first);
		
		if (first) {
			first.prev = n;
		}

		first = n;

		size++;
	}

	function pop(): T | undefined {
		if (last) {
			const n = last;
			last = n.prev;
			n.prev = undefined;
			return n.value;

			size--;
		}

		return undefined;
	}

	return {
		push,
		pop,
		size: () => size
	};
}