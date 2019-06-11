import { F0, F1, F2, F3, F4, S0, S1, S2, S3, S4, SelectorWatcher } from './interfaces';
import { paramCache } from './paramCache';
import { getState, onSelectorCacheReturn, registerSelectorPropWatcher, unregisterSelectorPropWatcher } from './store';
import { NOT_EXIST } from './paramMap';

let globalSelectorId = 0;

function selectorFunction<S, R>(nativeSelector: S0<S, R>, cacheSize?: number): F0<S, R>;
function selectorFunction<S, R, P1>(nativeSelector: S1<S, R, P1>, cacheSize?: number): F1<S, R, P1>;
function selectorFunction<S, R, P1, P2>(nativeSelector: S2<S, R, P1, P2>, cacheSize?: number): F2<S, R, P1, P2>;
function selectorFunction<S, R, P1, P2, P3>(nativeSelector: S3<S, R, P1, P2, P3>, cacheSize?: number): F3<S, R, P1, P2, P3>;
function selectorFunction<S, R, P1, P2, P3>(nativeSelector: S4<S, R, P1, P2, P3>, cacheSize?: number): F4<S, R, P1, P2, P3>;
function selectorFunction<S>(nativeSelector: any, cacheSize?: number): any {
    let shouldInvalidate = true;
    let cache = paramCache(cacheSize);

    const watcher: SelectorWatcher = {
        id: globalSelectorId++,
        invalidate() {
            if (!shouldInvalidate) {
                cache = paramCache();
                return shouldInvalidate = true;
            }

            return false;
        },
        getCache() {
            return cache;
        },
        run(params: any[]) {
            return cachedSelector.apply(null, params);
        },
        clearCache(params: any[]) {
            cache.remove(params);
        }
    };

    function runSelector(params: any[]) {
        registerSelectorPropWatcher(watcher, params);
        const selectorResult = nativeSelector(getState() as S, ...params);
        unregisterSelectorPropWatcher(watcher);
        cache.set(params, selectorResult);
        return selectorResult;
    }

    const cachedSelector = (...params: any[]) => {
        if (shouldInvalidate) {
            shouldInvalidate = false;
            return runSelector(params);

        } else {
            let cachedValue = cache.get(params);
            if (cachedValue === NOT_EXIST) {
                cachedValue = runSelector(params);
                cache.set(params, cachedValue);
            } else {
                onSelectorCacheReturn(watcher, params);
            }
            return cachedValue;
        }
    };

    cachedSelector.native = nativeSelector;
    cachedSelector.invalidate = () => {
        return watcher.invalidate();
    };

    return cachedSelector;
}

export const selector = selectorFunction;
