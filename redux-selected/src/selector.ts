import { F0, F1, F2, F3, F4, S0, S1, S2, S3, S4, SelectorWatcher, ParamCache, SelectorCallState } from './interfaces';
import { getState, beginSelectorRun, endSelectorRun, onSelectorCacheReturned, registerSelector } from './store2';
import { NOT_EXIST } from './paramMap';

let globalSelectorId = 0;

function selectorFunction<S, R>(nativeSelector: S0<S, R>, cacheSize?: number): F0<S, R>;
function selectorFunction<S, R, P1>(nativeSelector: S1<S, R, P1>, cacheSize?: number): F1<S, R, P1>;
function selectorFunction<S, R, P1, P2>(nativeSelector: S2<S, R, P1, P2>, cacheSize?: number): F2<S, R, P1, P2>;
function selectorFunction<S, R, P1, P2, P3>(nativeSelector: S3<S, R, P1, P2, P3>, cacheSize?: number): F3<S, R, P1, P2, P3>;
function selectorFunction<S, R, P1, P2, P3>(nativeSelector: S4<S, R, P1, P2, P3>, cacheSize?: number): F4<S, R, P1, P2, P3>;
function selectorFunction<S>(nativeSelector: any, cacheSize?: number): any {
    const watcher: SelectorWatcher = {
        id: globalSelectorId++,
        run(params: any[]) {
            return cachedSelector.apply(null, params);
        },
    };

    const paramCache: ParamCache<SelectorCallState> = registerSelector(watcher, cacheSize);

    function runSelector(params: any[]) {
        beginSelectorRun(watcher, params);
        const selectorResult = nativeSelector(getState() as S, ...params);
        endSelectorRun();
        paramCache.set(params, selectorResult);
        return selectorResult;
    }

    const cachedSelector = (...params: any[]) => {
        let callState = paramCache.get(params);
        if (callState === NOT_EXIST || (callState as SelectorCallState).cachedValue === NOT_EXIST) {
            return runSelector(params);
        } else {
            const selectorCallState = callState as SelectorCallState;
            onSelectorCacheReturned(selectorCallState);
            return selectorCallState.cachedValue;
        }
    };

    cachedSelector.native = nativeSelector;
    cachedSelector.invalidate = () => {
        // return watcher.invalidate();
    };

    return cachedSelector;
}

export const selector = selectorFunction;
