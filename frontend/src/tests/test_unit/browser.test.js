/* -- THIS FILE TESTS THE BROWSER COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateBrowser";

// Import actions
import {
  INSPECTOR_MODE_CAMERA,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_EXLUDED_INCLUDED,
  INSPECTOR_MODE_AREA,
  CHANGE_MODE,
  changeMode,
  CHANGE_BROWSER_TAB,
  changeBrowserTab,
} from "../../state/stateBrowser";

// Mock the error function.
// This is used to count the number of expected errors.
console.error = jest.fn();

describe("Browser reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle CHANGE_BROWSER_TAB", () => {
    // Action constant
    expect(CHANGE_BROWSER_TAB).toEqual("CHANGE_BROWSER_TAB");

    // Action creator
    expect(changeBrowserTab("fileBrowser")).toEqual({
      type: CHANGE_BROWSER_TAB,
      key: "fileBrowser",
    });

    // Action creator invalid key
    console.error.mockClear();
    expect(changeBrowserTab("fakeTab")).toEqual({
      type: CHANGE_BROWSER_TAB,
      key: undefined,
    });
    expect(console.error).toHaveBeenCalledTimes(1);

    // Change to Clip Browser
    expect(
      reducer(
        { ...initialState },
        {
          type: CHANGE_BROWSER_TAB,
          key: "clipBrowser",
        }
      )
    ).toEqual({
      ...initialState,
      currentTab: "clipBrowser",
    });

    // Change to File Browser
    expect(
      reducer(
        { ...initialState },
        {
          type: CHANGE_BROWSER_TAB,
          key: "fileBrowser",
        }
      )
    ).toEqual({
      ...initialState,
      currentTab: "fileBrowser",
    });

    // Change to Inspector Browser
    expect(
      reducer(
        { ...initialState },
        {
          type: CHANGE_BROWSER_TAB,
          key: "inspectorBrowser",
        }
      )
    ).toEqual({
      ...initialState,
      currentTab: "inspectorBrowser",
    });

    // Change to non-existent tab
    expect(
      reducer(
        { ...initialState },
        {
          type: CHANGE_BROWSER_TAB,
          key: undefined,
        }
      )
    ).toEqual({ ...initialState });
  });

  it("should handle CHANGE_MODE", () => {
    // Action constant
    expect(CHANGE_MODE).toEqual("CHANGE_MODE");

    // Action creator
    expect(changeMode(INSPECTOR_MODE_CAMERA, 69)).toEqual({
      type: CHANGE_MODE,
      mode: INSPECTOR_MODE_CAMERA,
      id: 69,
    });

    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_CLIP
    expect(
      reducer(
        {
          ...initialState,
          inspector: {
            ...initialState.inspector,
            mode: INSPECTOR_MODE_CAMERA,
          },
        },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_CLIP,
          id: 1337,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_CLIP,
        id: 1337,
      },
    });

    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_EXLUDED_INCLUDED
    expect(
      reducer(
        {
          ...initialState,
          inspector: {
            ...initialState.inspector,
            mode: INSPECTOR_MODE_CAMERA,
          },
        },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_EXLUDED_INCLUDED,
          id: 42,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_EXLUDED_INCLUDED,
        id: 42,
      },
    });

    // Change mode from INSPECTOR_MODE_CAMERA to INSPECTOR_MODE_AREA
    expect(
      reducer(
        {
          ...initialState,
          inspector: {
            ...initialState.inspector,
            mode: INSPECTOR_MODE_CAMERA,
          },
        },
        {
          type: CHANGE_MODE,
          mode: INSPECTOR_MODE_AREA,
          id: 73,
        }
      )
    ).toEqual({
      ...initialState,
      inspector: {
        mode: INSPECTOR_MODE_AREA,
        id: 73,
      },
    });
  });
});
