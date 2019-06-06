import { paramCache } from '../../redux-selected/src/paramCache';
import { NOT_EXIST } from '../../redux-selected/src/paramMap';

let cache: ReturnType<typeof paramCache>;

export default describe('paramcache', () => {
    beforeEach(() => {
        cache = paramCache(3);
    });

    it('returns the added', () => {
        const value = 'any value';
        cache.set([1, 2, 3], value);

        expect(cache.get([1, 2, 3])).toEqual(value);
    });

    it('should cache paramless', () => {
        const value1 = 'val 1';
        const value2 = 'val 2';
        cache.set([], value1);

        expect(cache.get([])).toBe(value1);

        cache.set([], value2);
        expect(cache.get([])).toBe(value2);

    })

    it('should drop least recent used without access', () => {
        const value1 = 'val 1';
        const value2 = 'val 2';
        const value3 = 'val 3';
        const value4 = 'val 4';

        cache.set([1], value1);
        cache.set([1, 2], value2);
        cache.set([1, 2, 3], value3);
        cache.set([1, 2, 3, 4], value4);

        expect(cache.get([1])).toEqual(NOT_EXIST);

    });

    it('should drop least recent used random access', () => {
        const value1 = 'val 1';
        const value2 = 'val 2';
        const value3 = 'val 3';
        const value4 = 'val 4';

        cache.set([1], value1);
        cache.set([1, 2], value2);
        cache.set([1, 2, 3], value3);

        expect(cache.get([1])).toBe(value1);
        expect(cache.get([1, 2])).toBe(value2);

        cache.set([1, 2, 3, 4], value4);

        expect(cache.get([1])).toBe(value1);
        expect(cache.get([1, 2])).toBe(value2);
        expect(cache.get([1, 2, 3])).toBe(NOT_EXIST);

        expect(cache.get([1, 2, 3, 4])).toBe(value4);

    });
});
