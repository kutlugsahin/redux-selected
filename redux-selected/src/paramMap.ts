import { ParamMap } from './interfaces';

export const NOT_EXIST = 'PARAM_CACHE_NOT_EXISTS';

interface CacheTreeNode<T> {
	parent?: CacheTreeNode<T>;
	children: Map<any, CacheTreeNode<T>>;
	key: any;
	value?: T;
	hasValue: boolean;
	paramArr: any[];
}

export function paramMap<T>(): ParamMap<T> {

	const cache = new Map<any, CacheTreeNode<T>>();
	const nodeList: CacheTreeNode<T>[] = [];

	function getNode(params: any[], createIfNotExist: boolean = false): CacheTreeNode<T> | undefined {
		if (params.length) {
			let parentNode: CacheTreeNode<T> | undefined;
			for (const param of params) {
				const currentMap: Map<any, CacheTreeNode<T>> = parentNode ? parentNode.children : cache;
				let currentNode: CacheTreeNode<T> | undefined = currentMap.get(param);

				if (currentNode === undefined) {
					if (createIfNotExist) {
						const newNode: CacheTreeNode<T> = {
							children: new Map(),
							key: param,
							parent: parentNode,
							value: undefined, // to be set later,
							hasValue: false,
							paramArr: undefined!,
						};

						currentMap.set(param, newNode);
						currentNode = newNode;

					} else {
						return undefined;
					}
				}

				parentNode = currentNode;
			}

			return parentNode;
		}

		// paramless cache return only value;
		let node = cache.get(undefined);

		if (!node) {
			node = {
				children: undefined!,
				key: undefined!,
				parent: undefined,
				value: undefined, // to be set later,
				hasValue: false,
				paramArr: undefined!,
			};

			cache.set(undefined, node);
		}
		return node;
	}

	function get(params: any[]): T | string {
		const node = getNode(params);

		if (node && node.hasValue) {
			return node.value!;
		}
		return NOT_EXIST;
	}

	function set(params: any[], value: T) {
		const node = getNode(params, true);

		if (node) {
			if (!node.hasValue) {
				// fist time node is added. So add it to list for quick traverse nodes
				node.paramArr = params;
				nodeList.push(node);
			}

			node.value = value;
			node.hasValue = true;
			return;
		}

		throw 'Not expected';
	}

	function remove(params: any[]): void {
		let currentNode = getNode(params);

		if (currentNode && currentNode.hasValue) {
			const index = nodeList.indexOf(currentNode);
			if (index > -1) {
				nodeList.splice(index, 1);
			}
		}

		while (currentNode) {
			currentNode.hasValue = false;
			currentNode.value = undefined;
			if (currentNode.children.size > 0) {
				break;
			}

			const currentMap = currentNode.parent ? currentNode.parent.children : cache;
			currentMap.delete(currentNode.key);
			currentNode = currentNode.parent;
		}
	}

	function toArray() {
		return nodeList.map(p => p.value!);
	}

	return {
		get,
		set,
		remove,
		toArray,
	};
}
