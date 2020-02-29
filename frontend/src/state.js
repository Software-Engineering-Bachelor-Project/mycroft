import { createStore, combineReducers } from 'redux';
import communicationReducer from './communication';
import testReducer from './test';

// Combine reducers
const rootReducer = combineReducers({
		com: communicationReducer,
		test: testReducer
});

const store = createStore(rootReducer);

export default store;
