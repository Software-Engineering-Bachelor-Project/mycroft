/* -- THIS FILE TESTS THE OBJECT DETECTOR COMPONENT -- */

// Reducer and initial state
import reducer, { initialState, TARGET } from "../../state/stateObjectDetector";

// Import actions
import {
  SET_RATE,
  setRate,
  SET_TARGET,
  setTarget,
  TOGGLE_IS_RUNNING,
  toggleIsRunning,
} from "../../state/stateObjectDetector";

describe("Object detector reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle SET_RATE", () => {
    let testState = {
      ...initialState,
      rate: 42,
    };

    // Action constant
    expect(SET_RATE).toEqual("SET_RATE");

    // Action creator
    expect(setRate(42)).toEqual({
      type: SET_RATE,
      payload: 42,
    });

    // Set with int
    expect(
      reducer(testState, {
        type: SET_RATE,
        payload: 1337,
      })
    ).toEqual({
      ...initialState,
      rate: 1337,
    });

    // Set with negative number, should set rate to zero
    expect(
      reducer(testState, {
        type: SET_RATE,
        payload: -42,
      })
    ).toEqual({
      ...initialState,
      rate: 0,
    });

    // Set with NaN, should not modify state
    expect(
      reducer(testState, {
        type: SET_RATE,
        payload: "five",
      })
    ).toEqual({
      ...initialState,
      rate: 42,
    });
  });

  it("should handle SET_TARGET", () => {
    // Action constant
    expect(SET_TARGET).toEqual("SET_TARGET");

    // Action creator
    expect(setTarget(TARGET.PROJECT)).toEqual({
      type: SET_TARGET,
      payload: TARGET.PROJECT,
    });

    // Set with valid target
    expect(
      reducer(initialState, {
        type: SET_TARGET,
        payload: TARGET.PROJECT,
      })
    ).toEqual({
      ...initialState,
      target: TARGET.PROJECT,
    });

    // Set same target
    expect(
      reducer(initialState, {
        type: SET_TARGET,
        payload: TARGET.FILTER,
      })
    ).toEqual(initialState);
  });

  it("should handle TOGGLE_IS_RUNNING", () => {
    // Action constant
    expect(TOGGLE_IS_RUNNING).toEqual("TOGGLE_IS_RUNNING");

    // Action creator
    expect(toggleIsRunning()).toEqual({
      type: TOGGLE_IS_RUNNING,
    });

    // Toggle from false to true
    expect(
      reducer(
        { ...initialState, isRunning: false },
        {
          type: TOGGLE_IS_RUNNING,
        }
      )
    ).toEqual({
      ...initialState,
      isRunning: true,
    });

    // Toggle from true to false
    expect(
      reducer(
        { ...initialState, isRunning: true },
        {
          type: TOGGLE_IS_RUNNING,
        }
      )
    ).toEqual({
      ...initialState,
      isRunning: false,
    });
  });
});
