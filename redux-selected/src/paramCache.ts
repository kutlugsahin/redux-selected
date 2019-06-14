import { lruOrderedList } from './lruOrderedList';
import { ParamCache } from './interfaces';
import { paramMap, NOT_EXIST } from './structures/paramMap';

interface CachedValue<T> {
    value: T;
    params: any[];
}

export function paramCache<T = any>(cacheSize: number = 10): ParamCache {
    let capacity = cacheSize;
    const cache = paramMap<CachedValue<T>>();
    const lruList = lruOrderedList();

    function get(params: any[]): T | string {
        const node = cache.get(params);

        if (node !== NOT_EXIST) {
            lruList.put((node as CachedValue<T>).params);
            return (node as CachedValue<T>).value;
        }
        return NOT_EXIST;
    }

    function set(params: any[], value: T) {
        cache.set(params, {
            params,
            value,
        });

        lruList.put(params);

        if (lruList.getCount() > capacity) {
            cache.remove(lruList.dropLast());
        }

    }

    function setSize(size: number) {
        capacity = size;
    }

    function remove(params:any[]) {
        cache.remove(params);
    }

    return {
        get,
        set,
        remove,
        setSize,
    };
}
