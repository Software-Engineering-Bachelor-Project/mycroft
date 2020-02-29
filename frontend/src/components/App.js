import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from '../state.js';
import TestComponent from './TestComponent';

/*
 * This is the main component of Mycroft.
 */

/* -- ROOT COMPONENT -- */
class App extends Component {
		render() {
				return (
						// We are currently using a test component as an example.
						// Please consult 'components/TestComponent.js'
						<TestComponent />
				);
		}
}

// Export App
export default App;

// Put App component in template
const container = document.getElementById('app');
// Note that the App is wrapped with react-redux's Provider
render(<Provider store={store}><App /></Provider>, container);
