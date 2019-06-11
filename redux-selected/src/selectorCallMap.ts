import { SelectorCall, ParamMap, SelectorCallMap } from "./interfaces";
import { paramMap, NOT_EXIST } from "./paramMap";

export function selectorCallMap<T>(): SelectorCallMap<T> {
	const map = new Map<number, ParamMap<T>>();
	function set(selectorCall: SelectorCall, value: T) {
		let paramCache = map.get(selectorCall.selectorId) as ParamMap<T>;
		if (paramCache === undefined) {
			map.set(selectorCall.selectorId, paramMap<T>());
		}
		paramCache.set(selectorCall.params, value);
	}
	function remove(selectorCall: SelectorCall) {
		const paramCache = map.get(selectorCall.selectorId) as ParamMap<T>;
		if (paramCache) {
			paramCache.remove(selectorCall.params);
		}
	}
	function get(selectorCall: SelectorCall) {
		const paramCache = map.get(selectorCall.selectorId) as ParamMap<T>;
		if (paramCache) {
			return paramCache.get(selectorCall.params);
		}
		return NOT_EXIST;
	}
	return {
		set,
		get,
		remove
	};
}
