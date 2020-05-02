/* -- THIS FILE TESTS THE MENU COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateMenu";

// Import actions
import {
  TOGGLE_OBJECT_DETECTION,
  toggleShowObjectDetection,
  TOGGLE_PROJECT_SWITCHER,
  toggleShowProjectSwitcher,
  TOGGLE_FOLDER_MANAGER,
  toggleShowFolderManager,
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

  it("should handle TOGGLE_PROJECT_SWITCHER", () => {
    // Action constant
    expect(TOGGLE_PROJECT_SWITCHER).toEqual("TOGGLE_PROJECT_SWITCHER");

    // Action creator
    expect(toggleShowProjectSwitcher()).toEqual({
      type: TOGGLE_PROJECT_SWITCHER,
    });

    // Toggle from false to true
    expect(
      reducer(
        { ...initialState, showProjectSwitcher: false },
        {
          type: TOGGLE_PROJECT_SWITCHER,
        }
      )
    ).toEqual({
      ...initialState,
      showProjectSwitcher: true,
    });

    // Toggle from true to false
    expect(
      reducer(
        { ...initialState, showProjectSwitcher: true },
        {
          type: TOGGLE_PROJECT_SWITCHER,
        }
      )
    ).toEqual({
      ...initialState,
      showProjectSwitcher: false,
    });
  });

  it("should handle TOGGLE_FOLDER_MANAGER", () => {
    // Action constant
    expect(TOGGLE_FOLDER_MANAGER).toEqual("TOGGLE_FOLDER_MANAGER");

    // Action creator
    expect(toggleShowFolderManager()).toEqual({
      type: TOGGLE_FOLDER_MANAGER,
    });

    // Toggle from false to true
    expect(
      reducer(
        { ...initialState, showFolderManager: false },
        {
          type: TOGGLE_FOLDER_MANAGER,
        }
      )
    ).toEqual({
      ...initialState,
      showFolderManager: true,
    });

    // Toggle from true to false
    expect(
      reducer(
        { ...initialState, showFolderManager: true },
        {
          type: TOGGLE_FOLDER_MANAGER,
        }
      )
    ).toEqual({
      ...initialState,
      showFolderManager: false,
    });
  });
});
