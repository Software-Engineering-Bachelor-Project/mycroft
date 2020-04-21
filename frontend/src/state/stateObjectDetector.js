export const TARGET = {
  PROJECT: "projects",
  CLIPS: "clips",
};

/* -- ACTIONS -- */
export const SET_RATE = "SET_RATE";
export const SET_TARGET = "SET_TARGET";
export const TOGGLE_IS_RUNNING = "TOGGLE_IS_RUNNING";

/* -- INITIAL STATE -- */
export const initialState = {
  rate: 5,
  target: TARGET.CLIPS,
  isRunning: false,
};

/* -- ACTION CREATORS -- */

/**
 * Sets the rate for object detection.
 * @param {Number} newRate New rate which is a non negative integer.
 * @return {action} action for setting the rate.
 */
export function setRate(newRate) {
  return {
    type: SET_RATE,
    payload: newRate,
  };
}

/**
 * Sets the target for object detection.
 * @param {string} newTarget New target (from TARGET).
 * @return {action} action for setting the target.
 */
export function setTarget(newTarget) {
  return {
    type: SET_TARGET,
    payload: newTarget,
  };
}

/**
 * Toggles if object detection is running.
 * @return {action} action for toggling isRunning.
 */
export function toggleIsRunning() {
  return {
    type: TOGGLE_IS_RUNNING,
  };
}

/* -- REDUX REDUCER -- */
const objectDetectorReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RATE:
      if (isNaN(action.payload)) return state; // Error handling
      return {
        ...state,
        rate: Math.max(action.payload, 0),
      };
    case SET_TARGET:
      return {
        ...state,
        target: action.payload,
      };
    case TOGGLE_IS_RUNNING:
      return {
        ...state,
        isRunning: !state.isRunning,
      };
    default:
      return state;
  }
};

export default objectDetectorReducer;
