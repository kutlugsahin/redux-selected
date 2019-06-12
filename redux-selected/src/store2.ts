import { paramCache } from "./paramCache";
import { ParamCache, SelectorWatcher, SelectorCallState, SelectorCall, SelectorCallMap, Dictionary } from "./interfaces";
import { NOT_EXIST } from "./paramMap";
import { selectorCallMap } from "./selectorCallMap";
import { Store } from "redux";
import { reduxsPathInitializeActionType } from "./constants";

let store: Store;
let state: any;
let selectorStore = new Map<number, ParamCache<SelectorCallState>>();
let selectors = new Map<number, SelectorWatcher>();
let selectorCallQueue: SelectorCallState[] = [];
let reducerListenerCalls = new Map<string, SelectorCallMap<SelectorCallState>>();
let updatedReducers: Dictionary<boolean> = {};

function addSelectorDependency(dependent: SelectorCallState, dependency: SelectorCallState) {
	dependent.dependencies.set(dependency.selectorCall, dependency);
	dependency.dependents.set(dependent.selectorCall, dependent);
}

function addReducerDependency(dependent: SelectorCallState, path: string) {
	// TODO
	let reducerPathMap = reducerListenerCalls.get(path);

	if (!reducerPathMap) {
		reducerPathMap = selectorCallMap()
		reducerListenerCalls.set(path, reducerPathMap);
	}

	reducerPathMap.set(dependent.selectorCall, dependent);
}

function clearSelectorDependency(selectorCallData: SelectorCallState) {
	for (const [path, map] of reducerListenerCalls) {
		map.remove(selectorCallData.selectorCall);
	}

	for (const dependency of selectorCallData.dependencies.toArray()) {
		dependency.dependents.remove(selectorCallData.selectorCall);
	}

	selectorCallData.dependencies = selectorCallMap();
}

function notifyWatcherForPaths(paths: string[]) {
	const selectorCallDatas = paths.reduce((acc: SelectorCallState[], path) => { 
		const map = reducerListenerCalls.get(path)!;
		const callDatas = map.toArray();
		return [...acc, ...callDatas];
	}, []);

	let currentSelectorCallData = selectorCallDatas.pop();

	while (currentSelectorCallData) {
		const cachedValue = currentSelectorCallData.cachedValue;
		if (cachedValue !== NOT_EXIST) {
			clearSelectorDependency(currentSelectorCallData);
			const newValue = currentSelectorCallData.runParameterizedSelector();
			if (newValue !== cachedValue) {
				currentSelectorCallData.cachedValue = NOT_EXIST;

				const dependents = currentSelectorCallData.dependents.toArray();

				if (dependents.length) {
					for (const dependent of dependents) {
						selectorCallDatas.unshift(dependent);
					}
				}
			}
		}
		currentSelectorCallData = selectorCallDatas.pop();
	}
}

export function registerSelector(selector: SelectorWatcher, cacheSize = 10) {
	selectors.set(selector.id, selector);
	const cache = paramCache<SelectorCallState>(cacheSize);
	selectorStore.set(selector.id, cache);
	return cache;
}

export function beginSelectorRun(selector: SelectorWatcher, params: any[] = []) {
	let selectorCallData = selectorStore.get(selector.id)!.get(params);

	if (selectorCallData === NOT_EXIST) {
		selectorCallData = {
			cachedValue: NOT_EXIST,
			dependencies: selectorCallMap(),
			dependents: selectorCallMap(),
			selectorCall: {
				params,
				selectorId: selector.id,
			},
			runParameterizedSelector() {
				return selector.run(params);
			}
		}

		selectorStore.get(selector.id)!.set(params, selectorCallData);
	}

	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];

	selectorCallQueue.push(selectorCallData as SelectorCallState)

	if (activeSelector) {
		addSelectorDependency(activeSelector, selectorCallData as SelectorCallState);
	}
}

export function endSelectorRun() {
	selectorCallQueue.pop();
}

export function onReducerPathRead(path: string) {
	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];
	if (activeSelector) {
		addReducerDependency(activeSelector, path);
	}
}

export function onSelectorCacheReturned(selectorCallState: SelectorCallState) {
	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];
	if (activeSelector) {
		addSelectorDependency(activeSelector, selectorCallState);
	}
}

export function getSelectorCallCachedValue(selectorCall: SelectorCall) {
	return selectorStore.get(selectorCall.selectorId)!.get(selectorCall.params);
}

export function setSelectorCallCachedValue(selectorCall: SelectorCall, value: any) {
	const data = selectorStore.get(selectorCall.selectorId)!.get(selectorCall.params) as SelectorCallState;
	data.cachedValue = value;
}

export function onReducerPathUpdated(path: string) {
	updatedReducers[path] = true;
}

export function onStoreUpdated() {
	const paths = Object.keys(updatedReducers);
	updatedReducers = {};
	notifyWatcherForPaths(paths);
}

export function getState() {
	if (!state) {
		state = createStateProxy(store.getState(), onReducerPathRead);
	}
	return state;
}

function resetVariables() {
	store = undefined!;
	state = undefined;
	
}

function setupStore(reduxStore: Store) {
	// resetVariables();
	store = reduxStore;
	store.dispatch({
		type: reduxsPathInitializeActionType,
		payload: {
			path: [],
		},
	});

	store.subscribe(onStoreUpdated);
}

function createStateProxy(reduxState: any, pathReadCallback: (path: string) => void, path: string[] = []) {
	return Object.keys(reduxState).reduce((acc: any, key: string) => {

		const currentPath = [...path, key];
		const currentPathString = currentPath.join('.');

		if (reducers.get(currentPathString)) {
			Object.defineProperty(acc, key, {
				get: () => {
					pathReadCallback(currentPathString);
					return get(store.getState(), currentPath);
				},
			});
		} else if (typeof reduxState === 'object') {
			acc[key] = createStateProxy(reduxState[key], pathReadCallback, currentPath);
		}

		return acc;
	}, {});
}

