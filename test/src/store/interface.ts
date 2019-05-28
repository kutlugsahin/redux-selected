import { ItemState } from "./reducers/item";
import { ItemListState } from "./reducers/itemlist";

export interface Action {
	type: string;
	payload: any
}

export interface State {
	item: ItemState;
	itemlist: ItemListState;
}