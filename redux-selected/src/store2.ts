import { paramCache } from "./paramCache";
import { ParamCache, SelectorWatcher, SelectorCallState, SelectorCall, SelectorCallMap, Dictionary } from "./interfaces";
import { NOT_EXIST } from "./structures/paramMap";
import { selectorCallMap } from "./selectorCallMap";
import { Store } from "redux";
import { reduxsPathInitializeActionType } from "./constants";

let store: Store;
let state: any;
let selectorStore = new Map<number, ParamCache<SelectorCallState>>();
let selectors = new Map<number, SelectorWatcher>();
let selectorCallQueue: SelectorCallState[] = [];
let reducerListenerCalls = new Map<string, Set<SelectorCallState>>();
let updatedReducers: Dictionary<boolean> = {};

function addSelectorDependency(dependent: SelectorCallState, dependency: SelectorCallState) {
	dependent.dependencies.set(dependency, true);
	dependency.dependents.set(dependent, true);
}

function addReducerDependency(dependent: SelectorCallState, path: string) {
	// TODO
	let reducerPathSet = reducerListenerCalls.get(path);

	if (!reducerPathSet) {
		reducerPathSet = new Set();
	}

	reducerPathSet.add(dependent);
}

function clearSelectorDependency(selectorCallData: SelectorCallState) {
	for (const [path, set] of reducerListenerCalls) {
		set.delete(selectorCallData);
	}

	for (const dependency of selectorCallData.dependencies.keys()) {
		dependency.dependents.delete(selectorCallData);
	}

	selectorCallData.dependencies = new Map();
}

function notifyWatcherForPaths(paths: string[]) {
	const selectorCallStates = paths.reduce((acc: SelectorCallState[], path) => {
		return [...acc, ...reducerListenerCalls.get(path)!.keys()];
	}, []);

	let currentSelectorCallData = selectorCallStates.pop();

	while (currentSelectorCallData) {
		const cachedValue = currentSelectorCallData.cachedValue;
		if (cachedValue !== NOT_EXIST) {
			clearSelectorDependency(currentSelectorCallData);
			const newValue = currentSelectorCallData.runParameterizedSelector();
			if (newValue !== cachedValue) {
				currentSelectorCallData.cachedValue = NOT_EXIST;

				const dependents = currentSelectorCallData.dependents.keys();

				for (const dependent of dependents) {
					selectorCallStates.unshift(dependent);
				}
			}
		}
		currentSelectorCallData = selectorCallStates.pop();
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
			dependencies: new Map(),
			dependents: new Map(),
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

