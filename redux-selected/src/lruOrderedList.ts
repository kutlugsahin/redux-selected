interface LruOrderedList {
    put: (item: any) => void;
    getCount: () => number;
    dropLast: () => any;
    toArray: () => any[];
}

interface LruListItem {
    prev?: LruListItem;
    next?: LruListItem;
    value: any;
}

export function lruOrderedList(): LruOrderedList {
    const map = new Map<any, LruListItem>();
    let first: LruListItem | undefined;
    let last: LruListItem | undefined;
    let count = 0;

    function put(item: any) {
        let node = map.get(item);

        if (node) {
            // existing node
            if (node === first) {
                // no need to reorder nodes
                return;
            }

            if (node.prev) {
                node.prev.next = node.next;
            } else {
                // means its last => update last
                if (node.next) {
                    last = node.next;
                }
            }

            if (node.next) {
                node.next.prev = node.prev;
            }
            node.next = undefined;
            node.prev = undefined;
        } else {
            count++;
            node = {
                value: item,
                prev: undefined,
                next: undefined,
            };

            map.set(item, node);
        }

        if (first) {
            first.next = node;
            node.prev = first;
            first = node;
        } else {
            last = node;
            first = node;
        }
    }

    function dropLast(): any {
        if (last) {
            const droppedValue = last.value;
            if (last.next) {
                last.next.prev = undefined;
            }
            map.delete(last.value);
            count--;
            last = last.next;

            return droppedValue;
        }
    }

    function getCount() {
        return count;
    }

    function toArray() {
        const result = [];
        let current: LruListItem | undefined = first;
        while (current) {
            result.push(current.value);
            current = current.prev;
        }
        return result;
    }

    return {
        put,
        getCount,
        dropLast,
        toArray,
    };
}
