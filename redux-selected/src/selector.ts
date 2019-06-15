import { F0, F1, F2, F3, F4, S0, S1, S2, S3, S4, SelectorWatcher } from './interfaces';
import { beginSelectorRun, endSelectorRun, getState, onSelectorCacheReturned } from './store';
import { selectorStore } from './selectorStore';

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

    function runSelector(params: any[]) {
        beginSelectorRun(watcher, params);
        const selectorResult = nativeSelector(getState() as S, ...params);
        endSelectorRun();
        return selectorResult;
    }

    const cachedSelector = (...params: any[]) => {
        let callState = selectorStore.getSelectorCallState(watcher.id, params);
        if (!callState) {
            selectorStore.createSelectorCallState(watcher.id, params, () => runSelector(params));
            const result = runSelector(params);
            selectorStore.getSelectorCallState(watcher.id, params)!.value = result;
            return result;
        } else {
            onSelectorCacheReturned(callState)
            return callState.value;
        }
    };

    cachedSelector.native = nativeSelector;
    cachedSelector.invalidate = () => {
        // return watcher.invalidate();
    };

    return cachedSelector;
}

export const selector = selectorFunction;
