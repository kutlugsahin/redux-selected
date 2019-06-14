import { Action } from 'redux';

export interface ReduxsPathInitAction extends Action<any> {
    payload: {
        path: string[];
    };
}

export type Selector<TState = any, TResult = any> = (state: TState, ...params: any[]) => TResult;

export interface Dictionary<TValue> {
    [key: string]: TValue;
}

export interface SelectorWatcher {
    id: number;   
    run: (params: any[]) => any;
}

export type S0<S, R> = (state: S) => R;
export type S1<S, R, P1> = (state: S, p1: P1) => R;
export type S2<S, R, P1, P2> = (state: S, p1: P1, p2: P2) => R;
export type S3<S, R, P1, P2, P3> = (state: S, p1: P1, p2: P2, p3: P3) => R;
export type S4<S, R, P1, P2, P3> = (state: S, p1: P1, p2: P2, p3: P3, ...params: any[]) => R;

interface F<TN> {
    native: TN;
    invalidate: () => boolean;
}

export interface F0<S, R> extends F<S0<S, R>> {
    (): R;
}

export interface F1<S, R, P1> extends F<S1<S, R, P1>> {
    (p1: P1): R;
}

export interface F2<S, R, P1, P2> extends F<S2<S, R, P1, P2>> {
    (p1: P1, p2: P2): R;
}

export interface F3<S, R, P1, P2, P3> extends F<S3<S, R, P1, P2, P3>> {
    (p1: P1, p2: P2, p3: P3): R;
}

export interface F4<S, R, P1, P2, P3> extends F<S4<S, R, P1, P2, P3>> {
    (p1: P1, p2: P2, p3: P3, ...params: any[]): R;
}

export interface ParamCache<T = any> {
    get: (params: any[]) => T | string;
    set: (params: any[], val: T) => void;
    setSize: (size: number) => void;
    remove: (params: any[]) => void;
}

export interface ParamMap<T> {
    get: (params: any[]) => T | undefined;
    set: (params: any[], val: T) => void;
    remove: (params: any[]) => T | undefined;
    toArray: () => T[];
}

export interface SelectorCall {
    selectorId: number;
    params: any[];
}

export interface SelectorCallMap<T> {
    set: (selectorCall: SelectorCall, value: T) => void;
    get: (selectorCall: SelectorCall) => T | string;
    remove: (selectorCall: SelectorCall) => void;
    toArray: () => T[];
}

export interface SelectorCallState {
    selectorCall: SelectorCall;
    cachedValue: any;
    dependents: Map<SelectorCallState, boolean>;
    dependencies: Map<SelectorCallState, boolean>;
    runParameterizedSelector: () => any;
}