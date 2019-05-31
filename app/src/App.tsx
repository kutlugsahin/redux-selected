import React from 'react';

import UserList from './components/UserList';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { addUser, User } from './store/users';
import { setPanelState, PanelState } from './store/ui/panelStates';
import { selectLeftPanelState, selectFirstUser, selectTheme, selectFirstUserName } from './selectors';
import { State } from './store';
import { Theme, setTheme } from './store/ui/theme';

interface DispatchProps {
    addUser: (id: number, user: User) => void;
    setPanelState: (panel: string, state: PanelState) => void;
    setTheme: (theme: Theme) => void;
}

interface StateProps {
    leftPanelState: PanelState;
    firstUser: User;
    firstUserName: string;
    theme: Theme;
}

export interface OwnProps {

}

type AppProps = StateProps & DispatchProps & OwnProps;

let panelState = PanelState.close;

class App extends React.Component<AppProps, { index: number }> {
    constructor(props: any) {
        super(props);
        this.state = {
            index: 10
        };
    }


    render() {
        return (
            <div className={'container'} style={this.props.theme}>
                <div>
                    <b>{this.props.firstUserName}</b>
                </div>
                <div>
                    {this.props.firstUser ? <b>User: {this.props.firstUser.name}</b> : null}
                </div>
                <UserList index={this.state.index} />
                <button onClick={() => {
                    this.setState({
                        index: this.state.index + 1,
                    });

                    this.props.addUser(this.state.index, {
                        name: `p${this.state.index}`
                    })
                }}>update</button>
                <button onClick={() => {
                    panelState = panelState === PanelState.open ? PanelState.close : PanelState.open;
                    this.props.setPanelState('left', panelState);
                }}>togglePanel</button>
                <button onClick={() => this.props.setTheme({
                    backgroundColor: '#123',
                    color: 'white'
                })}>set dark</button>
            </div>
        );
    }
}

function mapDispatch(dispatch: Dispatch): DispatchProps {
    return bindActionCreators({
        addUser,
        setPanelState,
        setTheme,
    }, dispatch) as any;
}

function mapState(state: State): StateProps {
    return {
        leftPanelState: selectLeftPanelState(),
        firstUser: selectFirstUser(),
        firstUserName: selectFirstUserName(),
        theme: selectTheme(),
    }
}

export default connect<StateProps, DispatchProps, OwnProps, State>(mapState, mapDispatch)(App);

// export default () => <div>Appp</div>