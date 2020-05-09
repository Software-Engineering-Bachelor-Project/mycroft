/* -- THIS FILE TESTS THE PLAYER COMPONENT -- */

// Reducer and initial state
import reducer, {
  initialState,
  SET_POSITION,
  setPlayer,
} from "../../state/statePlayer";

// Import actions
import {
  PLAY_CLIP,
  PLAY,
  PAUSE,
  JUMP,
  pause,
  play,
  playClip,
  setPosition,
  jump,
} from "../../state/statePlayer";

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

  it("should handle PLAY", () => {
    // Next state
    var nextState = {
      ...initialState,
      playing: false, //player is not set, therefore playing is false
    };

    // Action constant
    expect(PLAY).toEqual("PLAY");

    // Action creator
    expect(play()).toEqual({
      type: PLAY,
    });

    expect(
      reducer(
        { ...initialState },
        {
          type: PLAY,
        }
      )
    ).toEqual(nextState);
  });

  it("should handle PAUSE", () => {
    // Next state
    var nextState = {
      ...initialState,
      playing: false,
    };

    // Action constant
    expect(PAUSE).toEqual("PAUSE");

    // Action creator
    expect(pause()).toEqual({
      type: PAUSE,
    });

    expect(
      reducer(
        { ...initialState },
        {
          type: PAUSE,
        }
      )
    ).toEqual(nextState);
  });

  it("should handle SET_POSITION", () => {
    // Setup variables
    var position = 1.0;

    var nextState = {
      ...initialState,
      position: 1,
    };

    // Action constant
    expect(SET_POSITION).toEqual("SET_POSITION");

    // Action creator
    expect(setPosition(position)).toEqual({
      type: SET_POSITION,
      position: position,
    });

    // Play new clip
    expect(
      reducer(
        { ...initialState },
        {
          type: SET_POSITION,
          position: position,
        }
      )
    ).toEqual(nextState);
  });

  it("should handle JUMP", () => {
    // Setup variables
    var timeDelta = -1.0;

    var nextState = {
      ...initialState,
    };

    // Action constant
    expect(JUMP).toEqual("JUMP");

    // Action creator
    expect(jump(timeDelta)).toEqual({
      type: JUMP,
      timeDelta: timeDelta,
    });
    // Play new clip
    //TODO: Cant find a way to do this in current implementation
  });
});
