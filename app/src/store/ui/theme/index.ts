const SET_THEME = 'SET_THEME';

export interface Theme {
	backgroundColor: string;
	color: string;
}

export const setTheme = (theme: Theme) => ({
	type: SET_THEME,
	payload: {
		theme,
	}
})

export default (state: Theme = { backgroundColor: '#ccc', color: 'black' }, action: ReturnType<typeof setTheme>) => {
	switch (action.type) {
		case SET_THEME:
			return {
				...state,
				...action.payload.theme,
			}
		default:
			return state;
	}
}