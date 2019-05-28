import { Action } from "redux";
const SET_PANEL_STATE = 'SET_PANEL_STATE';

export interface PanelStateState {
	[key: string]: PanelState;
}

export enum PanelState {
	open,
	close,
}

export interface PanelActionPayload {
	panel: string;
	state: PanelState;
}

export interface PanelAction extends Action {
	payload: PanelActionPayload;
}


export const setPanelState = (panelName: string, state: PanelState): PanelAction => {
	return {
		type: SET_PANEL_STATE,
		payload: {
			state,
			panel: panelName,
		}
	}
}

export default (state: PanelStateState = { left: PanelState.close }, { type, payload }: PanelAction) => {

	switch (type) {
		case SET_PANEL_STATE:
			return Object.assign({}, state, { [payload.panel]: payload.state });
		default:
			return state;
	}
}