import { Action, Reducer } from 'redux';
import { reduxsPathInitializeActionType } from './constants';
import { ReduxsPathInitAction } from './interfaces';
import { addReducerPath, onReducerStateChanged } from './store';

export function reducer<TState, TAction extends Action<any>>(nativeReducer: Reducer<TState, TAction>)
    : Reducer<TState, TAction> {
    let oldState: any;
    let path: string | undefined;
    return (state: TState | undefined, action: TAction) => {
        if (action.type === reduxsPathInitializeActionType) {
            if (!path) {
                path = (action as any as ReduxsPathInitAction).payload.path.join('.');
                addReducerPath(path);
            }
        }

        const newState = nativeReducer(state, action);

        if (path && oldState !== newState) {
            console.log(`reducer ${path} changed`, newState);
            onReducerStateChanged(path);
        }

        oldState = newState;

        return newState;
    };
}
