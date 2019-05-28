// import { selector } from '../src/selector';
// // const selector = require('../src/selector').selector;
// import { makeStore } from './store';
// import { State } from './store/interface';
// import { Item, ItemState } from './store/reducers/item';

// let store = makeStore();

// console.warn('SELECTOR:', selector);

// const getAllItems = (state: State) => {
//     return Object.keys(state.item).reduce((acc: Item[], key) => {
//         return [...acc, state.item[key]];
//     }, []);
// };

// const getItemListById = (state: State, id: string) => {
//     return state.itemlist[id];
// };

// const getItemById = (state: State, id: string) => {
//     return state.item[id];
// };

// const getItemListByItemId = (state: State, itemId: string) => {
//     const item = selectItemById(itemId);
//     if (item && item.itemListId) {
//         return selectItemListById(item.itemListId);
//     }

//     return undefined;
// };

// const selectAllItems = selector(getAllItems);

// const selectItemById = selector(getItemById);

// const selectItemListById = selector(getItemListById);

// const selectListItems = selector(getItemListByItemId);

// describe('store test', () => {
//     beforeAll(() => {
//         store = makeStore();
//         selectAllItems.invalidate();
//         selectItemById.invalidate();
//         selectItemListById.invalidate();
//         selectListItems.invalidate();
//     });

//     it('cache selectAllItems', () => {
//         const result = selectAllItems();
//         expect(result).toBe(selectAllItems());
//     });
// });

import { selector } from '../../redux-selected/src/selector';
import { makeStore } from './store';
import { State } from './store/interface';
import { Item, ItemState } from './store/reducers/item';

let store = makeStore();

const getAllItems = (state) => {
    // return Object.keys(state.item).reduce((acc, key) => {
    //     return [...acc, state.item[key]];
    // }, []);
    return 6;
};

const getItemListById = (state, id) => {
    return state.itemlist[id];
};

const getItemById = (state, id) => {
    return state.item[id];
};

const getItemListByItemId = (state, itemId) => {
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

describe('store test', () => {
    beforeAll(() => {
        store = makeStore();
        selectAllItems.invalidate();
        selectItemById.invalidate();
        selectItemListById.invalidate();
        selectListItems.invalidate();
    });

    it('cache selectAllItems', () => {
        const result = selectAllItems();
        expect(result).toBe(selectAllItems());
    });
});
