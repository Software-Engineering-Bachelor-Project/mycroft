import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from '../state.js';
import TestComponent from './TestComponent';

class App extends Component {
		render() {
				return (
						<TestComponent />
				);
		}
}

export default App;

const container = document.getElementById('app');
render(<Provider store={store}><App /></Provider>, container);
