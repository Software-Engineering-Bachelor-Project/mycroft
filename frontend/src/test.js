import { dispatch } from 'redux';
import { makePOST } from './util';

/* -- ACTIONS -- */
const INCREMENT_LOCAL = "INCREMENT_LOCAL";
const INPUT_CHANGE    = "INPUT_CHANGE";

// For server requests prefix with REQ and RCV
const REQ_NEW_COUNTER = "REQ_NEW_COUNTER";
const RCV_NEW_COUNTER = "RCV_NEW_COUNTER";

/* -- INITIAL STATE -- */
const initialState = {
		counter: 5,
		input: 0
}

/* -- ACTION CREATORS -- */

// Used for incrementing counter
export function incrementLocal() {
		return {
				type: INCREMENT_LOCAL
		};
}

// Should be called whenever input is changed
export function inputChange(n) {
		return {
				type: INPUT_CHANGE,
				num: n
		}
}

// Requests server for a value to update counter with
export function reqNewCounter(n) {
		return {
				type: REQ_NEW_COUNTER,
				dispatch: dispatch, // Note: dispatch provided to evoke rcv
		}
}

// Receive value from server to update counter with
function rcvNewCounter(n) { // Note: does not need to be exported!
		return {
				type: RCV_NEW_COUNTER
		}
}

/* -- REDUX REDUCER -- */
const testReducer = (state = initialState, action) => {
		switch(action.type) {
		case INCREMENT_LOCAL:
				var i = parseInt(state.input);
				return {
						...state,
						counter: parseInt(state.counter)
								+ (Number.isNaN(i) ? 0 : i)
				}
		case INPUT_CHANGE:
				return {
						...state,
						input: action.num
				}
		case REQ_NEW_COUNTER:
				makePOST("/test/counter", { // follow urls in 'Mycroft/urls.py'
								 counter: state.counter,
								 num: state.input
								})
						.then(data => {console.log(data)});
				return state;
		case RCV_NEW_COUNTER:

				return state;
		default:
				return state;
		}
}

export default testReducer;
