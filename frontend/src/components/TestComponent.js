import React, { Component } from 'react';
import { connect } from 'react-redux';
import { incrementLocal, inputChange, reqNewCounter } from '../test';

/* 
 * This component is meant to act as a working example of how
 * to tie Django REST, React, and Redux together. The component
 * is implemented in the same way that all components should be.
 * 
 * The example contains a counter, an input-field as well as
 * two buttons. One of the buttons will locally increment the
 * counter by the amount specified in the input-field. The
 * other button will instead make a POST-request, supplying
 * both the current counter value as well as the input-field.
 * A new counter value is then returned from the server.
 *
 * In order to understand the dev-environment, please read
 * the following files in descending order:
 * - frontend/src/state.js
 * - frontend/src/test.js
 * - frontend/src/communication.js (not required, but recommended)
 * - frontend/src/component/TestComponent.js (this file!)
 * - test_app/views.py
 * - Mycroft/urls.py (to understand view-to-url binding)
 * - test_app/urls.py
 * 
 */

/* -- TEST COMPONENT -- */
class TestComponent extends Component {
		render() {
				// The props used here are provided using the
				// two map-functions following this class.
				return (
						<div>
								<p>Counter: {this.props.counter}</p>
								<input type='number' min='0' max='99'
						onChange={(e) => this.props.inputChange(e.target.value)} />
								<button
						onClick={() => this.props.increment()}
								>Local Increment</button>
								<button
						onClick={() => this.props.request()}
								>Server Request</button>
						</div>
				);
		}
}

// Assigns state vaiables to component props.
// Essentially, counter and input will become
// two new props in component. See usage above.
const mapStateToProps = state => {
		return {
				counter: state.test.counter,
				input: state.test.input
		}
}

// Specifies dispatch-functions for component.
// These functions will become props, available
// and thus available in the component.
const mapDispatchToProps = dispatch => {
		return {
				increment: () => dispatch(incrementLocal()),
				inputChange: (n) => dispatch(inputChange(n)),
				request: () => dispatch(reqNewCounter())
		}
}

// Connect the two functions to the component
export default connect(
		mapStateToProps,
		mapDispatchToProps
)(TestComponent);
