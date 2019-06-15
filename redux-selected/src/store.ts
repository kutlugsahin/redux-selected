
import { SelectorWatcher, SelectorCallState, SelectorCall, SelectorCallMap, Dictionary } from "./interfaces";
import { NOT_EXIST } from "./structures/paramMap";
import { Store } from "redux";
import { reduxsPathInitializeActionType } from "./constants";
import { selectorStore } from "./selectorStore";
import { invalidateNodes } from "./cacheManager";

let store: Store;
let state: any;
let selectorCallQueue: SelectorCallState[] = [];
let reducerListenerCalls = new Map<string, Set<SelectorCallState>>();
let updatedReducers: Dictionary<boolean> = {};
let reducers: Map<string, boolean>;

function get(obj: any, path: string[]) {
	let current = obj;
	let pathIndex = 0;

	while (current !== undefined && pathIndex < path.length) {
		current = current[path[pathIndex]];
		pathIndex++;
	}

	return current;
}

function addSelectorDependency(dependent: SelectorCallState, dependency: SelectorCallState) {
	dependent.dependencies.set(dependency, true);
	dependency.dependents.set(dependent, true);
}

function addReducerDependency(dependent: SelectorCallState, path: string) {
	// TODO
	let reducerPathSet = reducerListenerCalls.get(path);

	if (!reducerPathSet) {
		reducerPathSet = new Set();
		reducerListenerCalls.set(path, reducerPathSet);
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

	invalidateNodes(selectorCallStates);
}

function resetVariables() {
	state = undefined;
	selectorCallQueue = [];
	reducerListenerCalls = new Map();
	updatedReducers = {};
	reducers = new Map();
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

export function beginSelectorRun(selector: SelectorWatcher, params: any[] = []) {
	const selectorCallData = selectorStore.getSelectorCallState(selector.id, params);
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

export function addReducerPath(path: string) {
	reducers.set(path, true);
}

export function setupStore(reduxStore: Store) {
	resetVariables();
	store = reduxStore;
	store.dispatch({
		type: reduxsPathInitializeActionType,
		payload: {
			path: [],
		},
	});

	store.subscribe(onStoreUpdated);
}

