import React, { Component } from 'react';
import { connect } from 'react-redux';
import { incrementLocal, inputChange, reqNewCounter } from '../test';

/* -- TEST COMPONENT -- */
class TestComponent extends Component {
		render() {
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

// Assigns state vaiables to component props
const mapStateToProps = state => {
		return {
				counter: state.test.counter,
				input: state.test.input
		}
}

// Specifies dispatch-functions for component
const mapDispatchToProps = dispatch => {
		return {
				increment: () => dispatch(incrementLocal()),
				inputChange: (n) => dispatch(inputChange(n)),
				request: () => dispatch(reqNewCounter())
		}
}

// Connect to component
export default connect(
		mapStateToProps,
		mapDispatchToProps
)(TestComponent);
