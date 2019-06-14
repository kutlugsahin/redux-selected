export interface Node<T> {
	prev?: Node<T>;
	next?: Node<T>;
	value: T;
}

export interface QueueStack<T = any> {
	push: (val: T) => void;
	pop: () => T | undefined;
	size: () => number;
}

export function node<T>(value: T, prev?: Node<T>, next?: Node<T>): Node<T> {
	return {
		value,
		prev,
		next,
	};
}