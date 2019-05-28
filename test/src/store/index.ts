import { createStore } from "redux";
import { selectCacheEnhancer, combineReducers } from '../../../redux-selected/src';
import { item } from './reducers/item';
import { itemlist } from './reducers/itemlist';

const reducer = combineReducers({
	item,
	itemlist,
})

export const makeStore = () => createStore(reducer, selectCacheEnhancer);