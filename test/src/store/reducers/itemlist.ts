import { Action } from "../interface";

export interface ItemListState {
	[id: string]: string[];
}

export const PUT_LIST = 'put-list';
export const DELETE_LIST = 'delete-list';

const randomId = () => (Math.random() * 100).toFixed();

const initalState = Array(100).fill(undefined).reduce((acc, _, index) => {
	acc[index] = {
		id: index,
		items: Array(10).fill(undefined).map(randomId),
	}
	return acc;
 }, {});

export const itemlist = (state: ItemListState = initalState, action: Action) => {
	switch (action.type) {
		case PUT_LIST:
			return {
				...state,
				[action.payload.id]: action.payload.items,
			};
		case DELETE_LIST:
			return {
				...state,
				[action.payload]: undefined,
			};
		default:
			return state;
	}
}