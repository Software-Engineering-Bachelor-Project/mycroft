/* -- THIS FILE TESTS THE PLAYER COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/statePlayer";

// Import actions
import { PLAY_CLIP, playClip } from "../../state/statePlayer";

describe("Player reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle PLAY_CLIP", () => {
    // Setup variables
    var clipID = 1;

    var nextState = {
      ...initialState,
      clipID: 1,
    };

    // Action constant
    expect(PLAY_CLIP).toEqual("PLAY_CLIP");

    // Action creator
    expect(playClip(clipID)).toEqual({
      type: PLAY_CLIP,
      clipID: clipID,
    });

    // Play new clip
    expect(
      reducer(
        { ...initialState },
        {
          type: PLAY_CLIP,
          clipID: clipID,
        }
      )
    ).toEqual(nextState);
  });
});
