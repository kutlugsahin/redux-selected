import { SelectorWatcher, SelectorCall, ParamMap } from "./interfaces";
import { paramMap } from "./structures/paramMap";

interface Dependent {
	id: number;
	paramsArr: any[][];
}

interface ParamedDependency {
	add: (dependentWatcher: SelectorWatcher, dependencyWatcher: SelectorWatcher, params?: any[]) => void;
	clear: (id: number) => void;
	getDepedents: (id: number) => Dependent[];
}

export function paramedDependency() {

	const dependentsMap = new Map<number, ParamMap<SelectorCall[]>>();

	function add(dependentCall: SelectorCall, dependencyCall: SelectorCall) {
		if (dependentsMap.get(dependentCall.selectorId) === undefined) {
			dependentsMap.set(dependentCall.selectorId, paramMap<SelectorCall[]>());
		}

		let selectorCalls = dependentsMap.get(dependentCall.selectorId)!.get(dependentCall.params) as SelectorCall[];

		if (!selectorCalls) {
			selectorCalls = [];
			dependentsMap.get(dependentCall.selectorId)!.set(dependentCall.params, selectorCalls);
		}

		selectorCalls.push(dependencyCall);
	}
}


