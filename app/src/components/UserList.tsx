import * as React from 'react';
import { User } from '../store/users';
import { State } from '../store';
import { selectUsers, selectUser } from '../selectors';
import { connect } from 'react-redux';

interface StateProps {
	users: User[];
}

interface OwnProps {
	index: number;
}

interface UserListState {
	selectedUserName: string;
}

export type UserListProps = StateProps & OwnProps;

class UserList extends React.Component<UserListProps, UserListState> {
	constructor(props: UserListProps) {
		super(props);
		this.state = {
			selectedUserName: '',
		}
	}

	render() {
		const userName = selectUser(this.state.selectedUserName);
		
		return (
			<div>
				<ul>
					{this.props.users.map(user => {
						return <li key={user.name} onClick={() => this.setState({selectedUserName: user.name})}>{user.name}</li>
					})}
				</ul>
				<div>
					<b>selected name: </b> {userName ? userName.name : 'N/A'}
				</div>
			</div>
		)
	}
}

function mapState(state: State): StateProps {
	return {
		users: selectUsers(),
	}
}

export default connect(mapState)(UserList);
