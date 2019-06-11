import { paramCache } from "./paramCache";
import { ParamCache, SelectorWatcher, SelectorCallData, SelectorCall, SelectorCallMap } from "./interfaces";
import { NOT_EXIST } from "./paramMap";
import { selectorCallMap } from "./selectorCallMap";

const selectorStore = new Map<number, ParamCache<SelectorCallData>>();
const selectors = new Map<number, SelectorWatcher>();
const selectorCallQueue: SelectorCallData[] = [];
const reducerListenerCalls = new Map<string, SelectorCallMap<boolean>>();

function registerSelector(selector: SelectorWatcher, cacheSize = 10) {
	selectors.set(selector.id, selector);
	selectorStore.set(selector.id, paramCache<SelectorCallData>(cacheSize));
}

function beginSelectorRun(selector: SelectorWatcher, params: any[] = []) {
	let selectorCallData = selectorStore.get(selector.id)!.get(params);

	if (selectorCallData === NOT_EXIST) {
		selectorCallData = {
			cachedValue: NOT_EXIST,
			dependencies: selectorCallMap(),
			dependents: selectorCallMap(),
			selectorCall: {
				params,
				selectorId: selector.id,
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

function endSelectorRun() {
	selectorCallQueue.pop();
}

function addSelectorDependency(dependent: SelectorCallData, dependency: SelectorCallData) {
	// TODO
}

function addReducerDependency(dependent: SelectorCallData, path: string) {
	// TODO
	

	reducerListenerCalls.set()
}

function onReducerPathRead(path: string) {
	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];
	if (activeSelector) {
		addReducerDependency(activeSelector, path);
	}
}

function onSelectorCacheReturned(selectorCallData: SelectorCallData) {
	const activeSelector = selectorCallQueue[selectorCallQueue.length - 1];
	if (activeSelector) {
		addSelectorDependency(activeSelector, selectorCallData);
	}
}

