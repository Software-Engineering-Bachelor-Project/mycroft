import { createStore, combineReducers } from "redux";
import communicationReducer from "./stateCommunication";
import playerReducer from "./statePlayer";
import mapReducer from "./stateMap";
import menuReducer from "./stateMenu";
import viewportReducer from "./stateViewport";
import timelineReducer from "./stateTimeline";
import browserReducer from "./stateBrowser";
import objectDetectorReducer from "./stateObjectDetector";

/*
 * This file contains the main state of Mycroft.
 * Application state is managed using Redux.
 */

// This is the root reducer. All reducers in Mycroft should
// be tied together here. See 'combineReducers' in Redux-
// documentation. Each reducer covers a specific state-group.
// Follow the imports for further info about each one.
const rootReducer = combineReducers({
  com: communicationReducer,
  player: playerReducer,
  map: mapReducer,
  menu: menuReducer,
  viewport: viewportReducer,
  timeline: timelineReducer,
  browser: browserReducer,
  od: objectDetectorReducer,
});

// Main state-container of Mycroft
const store = createStore(rootReducer);

export default store;
