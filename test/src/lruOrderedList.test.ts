import { lruOrderedList } from '../../redux-selected/src/lruOrderedList';

describe('lru ordered list', () => {
    it('count', () => {
        const lru = lruOrderedList();
        lru.put('a');
        lru.put('b');
        lru.put('c');

        expect(lru.getCount()).toEqual(3);
    });

    it('should order right', () => {
        const lru = lruOrderedList();
        lru.put('a');
        lru.put('a');
        lru.put('b');
        lru.put('b');
        lru.put('a');
        lru.put('b');
        lru.put('c');
        lru.put('c');

        let arr = lru.toArray();

        expect(arr.length).toBe(3);

        expect(arr[0]).toBe('c');
        expect(arr[1]).toBe('b');
        expect(arr[2]).toBe('a');

        lru.put('b');
        expect(lru.toArray()[0]).toBe('b');

        lru.put('a');
        expect(lru.toArray()[0]).toBe('a');

        lru.put('b');
        expect(lru.toArray()[1]).toBe('a');

        arr = lru.toArray();

        expect(arr.length).toBe(3);
        expect(arr[0]).toBe('b');
        expect(arr[1]).toBe('a');
        expect(arr[2]).toBe('c');
    });

    it('should drop right', () => {
        const lru = lruOrderedList();
        lru.put('a');
        lru.put('b');
        lru.put('c');

        const dropped = lru.dropLast();

        expect(dropped).toBe('a');

        lru.put('d');
        lru.put('b');

        expect(lru.dropLast()).toBe('c');
        expect(lru.dropLast()).toBe('d');
        expect(lru.dropLast()).toBe('b');

        expect(lru.dropLast()).toBe(undefined);
    });
});
