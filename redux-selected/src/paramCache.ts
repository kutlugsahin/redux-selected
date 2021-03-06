import { lruOrderedList } from './lruOrderedList';

export const NOT_EXITS = 'PARAM_CACHE_NOT_EXITS';

interface CacheTreeNode {
    parent?: CacheTreeNode;
    children: Map<any, CacheTreeNode>;
    key: any;
    value?: any;
    hasValue: boolean;
    paramArray?: any[];
}

export function paramCache(cacheSize: number = 10) {
    let capacity = cacheSize;

    const cache = new Map<any, CacheTreeNode>();
    const lruList = lruOrderedList();

    function getNode(params: any[], createIfNotExist: boolean = false): CacheTreeNode | undefined {
        if (params.length) {
            let parentNode: CacheTreeNode | undefined;
            for (const param of params) {
                const currentMap: Map<any, CacheTreeNode> = parentNode ? parentNode.children : cache;
                let currentNode: CacheTreeNode | undefined = currentMap.get(param);

                if (currentNode === undefined) {
                    if (createIfNotExist) {
                        const newNode: CacheTreeNode = {
                            children: new Map(),
                            key: param,
                            parent: parentNode,
                            paramArray: params,
                            value: undefined, // to be set later,
                            hasValue: false,
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
                paramArray: undefined,
                value: undefined, // to be set later,
                hasValue: false,
            };

            cache.set(undefined, node);
        }
        return node;
    }

    function get(params: any[]): any {
        const node = getNode(params);

        if (node && node.hasValue) {
            lruList.put(node.paramArray);
            return node.value;
        }
        return NOT_EXITS;
    }

    function set(params: any[], value: any) {
        const node = getNode(params, true);

        if (node) {
            node.value = value;
            node.hasValue = true;
            lruList.put(node.paramArray);

            if (lruList.getCount() > capacity) {
                remove(lruList.dropLast());
            }
        }
    }

    function remove(params: any[]) {
        let currentNode = getNode(params);

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

    function setSize(size: number) {
        capacity = size;
    }

    return {
        get,
        set,
        setSize,
    };
}
