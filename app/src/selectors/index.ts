import { State } from "../store";
import { User } from "../store/users";
import { PanelState } from "../store/ui/panelStates";
import { selector } from 'redux-selected';

export const selectUsers = selector((state: State): User[] => {
	return Object.keys(state.users).map(p => state.users[p]);
});

export const selectLeftPanelState = selector((state: State) => {
	return state.ui.panelState['left']
});

export const selectFirstUser = selector((state: State) => {
	if (selectLeftPanelState() === PanelState.open) {
		return state.users['1'];
	}

	return {
		name: 'dummy'
	};
})

export const selectFirstUserName = selector(() => {
	return selectFirstUser().name;
})

export const selectTheme = selector((state: State) => {
	return state.ui.theme;
});

export const selectUser = selector((state: State, name:string) => {
	return selectUsers().find(p => p.name === name);
})