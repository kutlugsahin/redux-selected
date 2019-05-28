import { createStore, compose } from 'redux';
import ui, { UIState } from './ui';
import users, { UsersState } from './users';
import { selectCacheEnhancer, combineReducers } from "redux-selected";
export interface State {
	ui: UIState;
	users: UsersState;
}

export const store = createStore(combineReducers({
	ui,
	users,
}), compose(selectCacheEnhancer, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()));
