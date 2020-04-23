/* -- THIS FILE TESTS THE VIEWPORT COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateViewport";

// Import actions
import { SWITCH_MODE, switchMode } from "../../state/stateViewport";

//import constants
import { MAP_MODE, PLAYER_MODE } from "../../state/stateViewport";

describe("Viewport reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle SWITCH_MODE", () => {
    // Action constant
    expect(SWITCH_MODE).toEqual("SWITCH_MODE");

    // Action creator
    expect(switchMode()).toEqual({
      type: SWITCH_MODE,
    });

    // Toggle from false to true
    // (from PLAYER_MODE to MAP_MODE)
    expect(
      reducer(
        { ...initialState, mode: PLAYER_MODE },
        {
          type: SWITCH_MODE,
        }
      )
    ).toEqual({
      ...initialState,
      mode: MAP_MODE,
    });

    // Toggle from true to false
    // (from MAP_MODE to PLAYER_MODE)
    expect(
      reducer(
        { ...initialState, mode: MAP_MODE },
        {
          type: SWITCH_MODE,
        }
      )
    ).toEqual({
      ...initialState,
      mode: PLAYER_MODE,
    });
  });
});
