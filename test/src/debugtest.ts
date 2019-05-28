import { makeStore } from "./store";
import { State } from "./store/interface";
import { selector } from "../../redux-selected/src";

let store = makeStore();

const a = store.getState();

// console.log(a);

const getAllItems = (state: State) => {
	return Object.keys(state.item).reduce((acc:any, key) => {
		return [...acc, state.item[key]];
	}, []);
};

const getItemListById = (state: State, id: string) => {
	return state.itemlist[id];
};

const getItemById = (state: State, id: string) => {
	return state.item[id];
};

const getItemListByItemId = (state: State, itemId: string) => {
	const item = selectItemById(itemId);
	if (item && item.itemListId) {
		return selectItemListById(item.itemListId);
	}

	return undefined;
};

const selectAllItems = selector(getAllItems);

const selectItemById = selector(getItemById);

const selectItemListById = selector(getItemListById);

const selectListItems = selector(getItemListByItemId);


const items = selectAllItems();