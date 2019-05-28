import { selector } from '../../../../redux-selected/src';
import { State } from '../interface';

// export const selectAllItems = selector((state: State) => {
// 	return Object.keys(state.item).reduce((acc, key) => {
// 		return [...acc, state.item[key]];
// 	}, []);
// });


// export const selectItemById = (state: State, id: string) => {
// 	return state.item[id];
// };

// export const selectItemListById = selector((state: State, id: string) => {
// 	return state.itemlist[id];
// })

// export const selectListItems = selector((state: State, itemId: string) => {
// 	const item = selectItemById(state, itemId);
// 	if (item && item.itemListId) {
// 		return selectItemListById(item.itemListId);
// 	}

// 	return undefined;
// });