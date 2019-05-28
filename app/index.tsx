import * as React from 'react';
import { render } from 'react-dom';
import App from './src/App';
import { Provider } from 'react-redux';
import { store } from './src/store';

render((
	<Provider store={store}>
		<App />
	</Provider>
), document.getElementById('app'));


