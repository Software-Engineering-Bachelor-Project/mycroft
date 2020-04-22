/* -- THIS FILE TESTS THE BROWSER COMPONENT -- */

// Reducer and initial state
import browserReducer, { initialState } from "../../state/stateBrowser";

// Import actions
import {
  INSPECTOR_MODE_CAMERA,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_EXLUDED_INCLUDED,
  INSPECTOR_MODE_AREA,
  CHANGE_MODE,
  changeMode,
} from "../../state/stateBrowser";

describe("Browser reducer", () => {
  it("should handle CHANGE_MODE", () => {
    // Action constant
    expect(CHANGE_MODE).toEqual("CHANGE_MODE");

    // Action creator
    expect(changeMode()).toEqual({
      type: CHANGE_MODE,
    });
  });

  it("should handle actions", () => {
    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_CLIP
    expect(
      browserReducer(
        { ...initialState },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_CLIP,
          id: 0,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_CLIP,
        id: 0,
      },
    });

    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_EXLUDED_INCLUDED
    expect(
      browserReducer(
        { ...initialState },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_EXLUDED_INCLUDED,
          id: 0,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_EXLUDED_INCLUDED,
        id: 0,
      },
    });

    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_AREA
    expect(
      browserReducer(
        { ...initialState },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_AREA,
          id: 0,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_AREA,
        id: 0,
      },
    });
  });
});
