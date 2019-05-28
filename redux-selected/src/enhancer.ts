import { StoreCreator } from 'redux';
import { setupStore } from './store';

export function enhancer(reduxStoreCreator: StoreCreator): StoreCreator {
    return (reducer: any, preloadedState?: any, enhancerFn?: any) => {
        const reduxStore = reduxStoreCreator(reducer, preloadedState, enhancerFn);
        const replacer = reduxStore.replaceReducer;

        reduxStore.replaceReducer = (...params) => {
            setupStore(reduxStore);
            return replacer(...params);
        };

        setupStore(reduxStore);
        return reduxStore;
    };
}
