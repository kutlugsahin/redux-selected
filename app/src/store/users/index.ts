import { Action, AnyAction } from "redux";

const ADD_USER = 'ADD_USER';
const DELETE_USER = 'DELETE_USER';
const UPDATE_USER = 'UPDATE_USER';

interface ActionWithPayload<T> extends Action {
	payload: T;
}

function createAction<T>(type: string, payload: T): ActionWithPayload<T> {
	return {
		type,
		payload,
	}
}

export const addUser = (id: string, user: User) => createAction(ADD_USER, { id, user });
export const deleteUser = (id: string) => createAction(ADD_USER, { id });
export const updateUser = (id: string, user: Partial<User>) => createAction(ADD_USER, { id, user });

type AddUserAction = ReturnType<typeof addUser>;
type DeleteUserAction = ReturnType<typeof deleteUser>;
type UpdateUserAction = ReturnType<typeof updateUser>;

type UserAction = AddUserAction | DeleteUserAction | UpdateUserAction;

export interface User {
	name: string;
}

export interface UsersState {
	[key: string]: User;
}

const initialState: UsersState = {
	'1': { name: 'p1' },
	'2': { name: 'p2' },
	'3': { name: 'p3' },
	'4': { name: 'p4' },
	'5': { name: 'p5' },
}

export default (state: UsersState = initialState, action: UserAction) => {
	switch (action.type) {
		case ADD_USER: {
			const { id, user } = (action as AddUserAction).payload;
			return {
				...state,
				[id]: user,
			}
		}
		case UPDATE_USER: {
			const { id, user } = (action as UpdateUserAction).payload;
			return {
				...state,
				[id]: {
					...state[id],
					...user,
				},
			}
		}
		case DELETE_USER: {
			const { id } = (action as DeleteUserAction).payload;
			const newState = { ...state };
			delete newState[id];
			return newState;
		}
		default:
			return state;
	}
}

