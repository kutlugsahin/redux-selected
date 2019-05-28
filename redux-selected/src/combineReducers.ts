import { combineReducers as reduxCombineReducers } from 'redux';
import { reduxsPathInitializeActionType } from './constants';
import { ReduxsPathInitAction } from './interfaces';
import { reducer } from './reducer';

const combinedReducerIdentifier = '@@REDUXS_COMBINED_REDUCER';

function makeReducer(nativeReducer: any) {
    const convertedReducer = reducer(nativeReducer);
    (convertedReducer as any)[combinedReducerIdentifier] = true;
    return convertedReducer;
}

function convertReducers(reducerMap: any) {
    return Object.keys(reducerMap).reduce((acc: any, key) => {
        acc[key] = reducerMap[key][combinedReducerIdentifier] ? reducerMap[key] : makeReducer(reducerMap[key]);
        return acc;
     }, {});
}

export function combineReducers(reducersMap: any): any {
    const convertedReducersMap = convertReducers(reducersMap);
    const combined = reduxCombineReducers(convertedReducersMap);

    const combinedReducer = (state: any, action: ReduxsPathInitAction) => {
        if (action.type === reduxsPathInitializeActionType) {
            Object.keys(convertedReducersMap).forEach((key) => {
                const childReducer = convertedReducersMap[key];

                childReducer(undefined, {
                    type: reduxsPathInitializeActionType,
                    payload: {
                        path: [...action.payload.path, key],
                    },
                });
            });
        }

        return combined(state, action);
    };

    (combinedReducer as any)[combinedReducerIdentifier] = true;

    return combinedReducer;
}
