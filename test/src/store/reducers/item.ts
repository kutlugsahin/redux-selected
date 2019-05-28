import { Action } from "../interface";

export interface Item {
	id: string,
	name: string;
	itemListId: string;
}

export interface ItemState {
	[key: string]: Item
}

export const SET_ITEM = 'set-item';
export const DELETE_ITEM = 'delete-item';

const randomId = () => (Math.random() * 100).toFixed();

const initialState = Array(1000).fill(undefined).reduce((acc, _, index) => {
	acc[index] = {
		id: index,
		name: `Item ${index}`,
		itemListId: randomId(),
	}

	return acc;
}, {});

export const item = (state: ItemState = initialState, action: Action) => {
	switch (action.type) {
		case SET_ITEM:
			return {
				...state,
				[action.payload.id]: action.payload,
			}
		case DELETE_ITEM:
			return {
				...state,
				[action.payload]: undefined,
			}
		default:
			return state;
	}
}