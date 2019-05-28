import { selector } from '../../redux-selected/src/selector';
import { makeStore } from './store';
import { State } from './store/interface';
import { Item, ItemState, SET_ITEM } from './store/reducers/item';

let store = makeStore();

const getAllItems = jest.fn((state: State) => {
    return Object.keys(state.item).reduce((acc: any, key) => {
        return [...acc, state.item[key]];
    }, []);
});

const getItemListById = jest.fn((state: State, id: string) => {
    return [...(state.itemlist[id].items)];
});

const getItemById = jest.fn((state: State, id: string) => {
    return {
        ...state.item[id]
    };
});

const getItemListByItemId = jest.fn((state: State, itemId: string) => {
    const item = selectItemById(itemId);
    if (item && item.itemListId) {
        return selectItemListById(item.itemListId);
    }

    return undefined;
});

const selectAllItems = selector(getAllItems);

const selectItemById = selector(getItemById);

const selectItemListById = selector(getItemListById);

const selectListItems = selector(getItemListByItemId);

describe('store test', () => {
    beforeEach(() => {
        selectAllItems.invalidate();
        selectItemById.invalidate();
        selectItemListById.invalidate();
        selectListItems.invalidate();

        getAllItems.mockClear();
        getItemListById.mockClear();
        getItemById.mockClear();
    });

    it('cache selectAllItems', () => {
        const result = selectAllItems();
        expect(result).toBe(selectAllItems());
    });

    it('cache selectItemById', () => {
        const result1 = selectItemById('5');
        const result2 = selectItemById('3');
        const result3 = selectItemById('10');

        expect(result1.id).toBe('5');
        expect(result2.id).toBe('3');
        expect(result3.id).toBe('10');

        expect(result1).toBe(selectItemById('5'))
        expect(result2).toBe(selectItemById('3'))
        expect(result3).toBe(selectItemById('10'))

        expect(getItemById).toBeCalledTimes(3);
    });

    it('cache selectItemListById', () => {
        const result1 = selectItemListById('5');
        const result2 = selectItemListById('3');
        const result3 = selectItemListById('10');

        expect(result1).toBe(selectItemListById('5'))
        expect(result2).toBe(selectItemListById('3'))
        expect(result3).toBe(selectItemListById('10'))
    });

    it('invalidates cached result when store updated', () => {
        const result1 = selectItemById('5');
        const result2 = selectItemById('5');

        expect(result1).toBe(result2);
        expect(getItemById).toBeCalledTimes(1);
        store.dispatch({
            type: SET_ITEM,
            payload: {
                id: 'New Item',
                name: 'New Item'
            }
        });

        const result3 = selectItemById('5');

        expect(result1).not.toBe(result3);
        expect(result3.id).toBe('5');
        expect(getItemById).toBeCalledTimes(2);
    })
});
