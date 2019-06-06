import { lruOrderedList } from './lruOrderedList';
import { ParamCache } from './interfaces';
import { paramMap, NOT_EXIST } from './paramMap';

interface CachedValue {
    value: any;
    params: any[];
}

export function paramCache(cacheSize: number = 10): ParamCache {
    let capacity = cacheSize;
    const cache = paramMap<CachedValue>();
    const lruList = lruOrderedList();

    function get(params: any[]): any {
        const node = cache.get(params);

        if (node !== NOT_EXIST) {
            lruList.put((node as CachedValue).params);
            return (node as CachedValue).value;
        }
        return NOT_EXIST;
    }

    function set(params: any[], value: any) {
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

    return {
        get,
        set,
        setSize,
    };
}
