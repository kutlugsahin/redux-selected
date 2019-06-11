import { paramCache } from "./paramCache";
import { ParamCache, SelectorWatcher, SelectorCallData, SelectorCall, SelectorCallMap, Dictionary } from "./interfaces";
import { NOT_EXIST } from "./paramMap";
import { selectorCallMap } from "./selectorCallMap";

const selectorStore = new Map<number, ParamCache<SelectorCallData>>();
const selectors = new Map<number, SelectorWatcher>();
const selectorCallQueue: SelectorCallData[] = [];
const reducerListenerCalls = new Map<string, SelectorCallMap<SelectorCallData>>();
let updatedReducers: Dictionary<boolean> = {};

function addSelectorDependency(dependent: SelectorCallData, dependency: SelectorCallData) {
	dependent.dependencies.set(dependency.selectorCall, dependency);
	dependency.dependents.set(dependent.selectorCall, dependent);
}

function addReducerDependency(dependent: SelectorCallData, path: string) {
	// TODO
	let reducerPathMap = reducerListenerCalls.get(path);

	if (!reducerPathMap) {
		reducerPathMap = selectorCallMap()
		reducerListenerCalls.set(path, reducerPathMap);
	}

	reducerPathMap.set(dependent.selectorCall, dependent);
}

function clearSelectorDependency(selectorCallData: SelectorCallData) {
	for (const [path, map] of reducerListenerCalls) {
		map.remove(selectorCallData.selectorCall);
	}

	for (const dependency of selectorCallData.dependencies.toArray()) {
		dependency.dependents.remove(selectorCallData.selectorCall);
	}

	selectorCallData.dependencies = selectorCallMap();
}

function notifyWatcherForPaths(paths: string[]) {
	const selectorCallDatas = paths.reduce((acc: SelectorCallData[], path) => { 
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
	selectorStore.set(selector.id, paramCache<SelectorCallData>(cacheSize));
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

	selectorCallQueue.push(selectorCallData as SelectorCallData)

	if (activeSelector) {
		addSelectorDependency(activeSelector, selectorCallData as SelectorCallData);
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

export function onSelectorCacheReturned(selectorCallData: SelectorCallData) {
	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];
	if (activeSelector) {
		addSelectorDependency(activeSelector, selectorCallData);
	}
}

export function getSelectorCallCachedValue(selectorCall: SelectorCall) {
	return selectorStore.get(selectorCall.selectorId)!.get(selectorCall.params);
}

export function setSelectorCallCachedValue(selectorCall: SelectorCall, value: any) {
	const data = selectorStore.get(selectorCall.selectorId)!.get(selectorCall.params) as SelectorCallData;
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

