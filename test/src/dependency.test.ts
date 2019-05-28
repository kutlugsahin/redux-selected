import { dependency as dependenyMap } from '../../redux-selected/src/dependency';
import { Watcher } from '../../redux-selected/src/interfaces';

function watcher(id: number): Watcher {
	return {
		id,
		notify() { 
			return false;
		}
	}
}

const w1 = watcher(1);
const w2 = watcher(2);
const w3 = watcher(3);
const w4 = watcher(4);
const w5 = watcher(5);
const w6 = watcher(6);

describe('dependency test', () => {
	let dependency: ReturnType<typeof dependenyMap>;
	beforeEach(() => {
		dependency = dependenyMap();
	});
	it('should add dependency', () => {
		dependency.addDependency(w1, w2);
		dependency.addDependency(w1, w3);
		dependency.addDependency(w1, w4);

		dependency.addDependency(w2, w5);
		dependency.addDependency(w2, w6);

		expect(dependency.getDependents(2)).toEqual([1]);
		expect(dependency.getDependents(3)).toEqual([1]);
		expect(dependency.getDependents(4)).toEqual([1]);
		expect(dependency.getDependents(5)).toEqual([2]);
		expect(dependency.getDependents(6)).toEqual([2]);
	});
	it('should add clear dependecies', () => {
		dependency.addDependency(w1, w2);
		dependency.addDependency(w1, w3);
		dependency.addDependency(w1, w4);

		dependency.addDependency(w2, w5);
		dependency.addDependency(w2, w6);

		expect(dependency.getDependents(2)).toEqual([1]);
		expect(dependency.getDependents(3)).toEqual([1]);
		expect(dependency.getDependents(4)).toEqual([1]);

		dependency.clearDependencies(1);

		expect(dependency.getDependents(2)).toEqual([]);
	});
})