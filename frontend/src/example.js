import store from './state';
import { makePOST } from './util';

/*
 * This file defines the state, reducers, and actions
 * used by examples and non-production code in general.
 * 
 * Each reducer-file, such as this one, is split up
 * into four distinct parts:
 * - ACTIONS         : action type constants
 * - INITIAL STATE   : the initial state of the reducer
 * - ACTION CREATORS : functions used to create actions
 * - REDUX REDUCER   : the reducer-function of this class
 * Read each part for further information. Please stick
 * to one exact name per action as done in this file.
 *
 * Even though the code won't get used in the final
 * product, please make sure to keep it neat.
 * 
 */

/* -- ACTIONS -- */
const INCREMENT_LOCAL = "INCREMENT_LOCAL";
const INPUT_CHANGE    = "INPUT_CHANGE";

// For server requests such as POST, create
// two actions prefixed with REQ and RCV since
// the response must be handled separately.
const REQ_NEW_COUNTER = "REQ_NEW_COUNTER";
const RCV_NEW_COUNTER = "RCV_NEW_COUNTER";

/* -- INITIAL STATE -- */
const initialState = {
    counter: 5,
    input: 0 // This value is bound to an input-field
}

/* -- ACTION CREATORS -- */

// This chapter should contain descriptions
// of each action.

// Used for incrementing counter locally
export function incrementLocal() {
    return {
	type: INCREMENT_LOCAL
    };
}

// Should be dispatched whenever input is changed
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
	dispatch: store.dispatch // Note: dispatch-function provided to allow for a new dispatch on receival.
    }
}

// Receive value from server to update counter with
function rcvNewCounter(n) { // Note: does not need to be exported!
    return {
	type: RCV_NEW_COUNTER,
	num: n
    }
}

/* -- REDUX REDUCER -- */
const exampleReducer = (state = initialState, action) => {
    switch(action.type) {
    case INCREMENT_LOCAL:
	// Increment counter locally
	var i = parseInt(state.input);
	return {
	    ...state,
	    counter: parseInt(state.counter)
		+ (Number.isNaN(i) ? 0 : i)
	}
    case INPUT_CHANGE:
	// Update input
	return {
	    ...state,
	    input: action.num
	}
    case REQ_NEW_COUNTER:
	// Make POST-request. See 'util.js'.
	makePOST("/test/counter/", { // follow urls in 'Mycroft/urls.py'
	    counter: state.counter,
	    num: state.input
	})
	// Since response is received async, we must dispatch a new event on receival
	    .then(data => action.dispatch(rcvNewCounter(data.counter)));

	// You may want to flip a boolean to tell the application
	// that we are waiting for a receival.
	return state;
    case RCV_NEW_COUNTER:
	// Set counter to POST-result
	return {
	    ...state,
	    counter: action.num
	};
    default:
	return state;
    }
}

export default exampleReducer;
