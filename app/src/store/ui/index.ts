import panelState, { PanelStateState } from './panelStates';
import { combineReducers } from 'redux-selected';
import theme, { Theme } from './theme';

export interface UIState {
	panelState: PanelStateState;
	theme: Theme;
}

export default combineReducers({
	panelState,
	theme,
});