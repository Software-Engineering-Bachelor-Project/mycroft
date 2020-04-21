/* -- THIS FILE TESTS THE MENU COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateMenu";

// Import actions
import {
  TOGGLE_OBJECT_DETECTION,
  toggleShowObjectDetection,
} from "../../state/stateMenu";

describe("Menu reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle TOGGLE_OBJECT_DETECTION", () => {
    // Action constant
    expect(TOGGLE_OBJECT_DETECTION).toEqual("TOGGLE_OBJECT_DETECTION");

    // Action creator
    expect(toggleShowObjectDetection()).toEqual({
      type: TOGGLE_OBJECT_DETECTION,
    });

    // Toggle from false to true
    expect(
      reducer(
        { ...initialState, showObjectDetection: false },
        {
          type: TOGGLE_OBJECT_DETECTION,
        }
      )
    ).toEqual({
      ...initialState,
      showObjectDetection: true,
    });

    // Toggle from true to false
    expect(
      reducer(
        { ...initialState, showObjectDetection: true },
        {
          type: TOGGLE_OBJECT_DETECTION,
        }
      )
    ).toEqual({
      ...initialState,
      showObjectDetection: false,
    });
  });
});
