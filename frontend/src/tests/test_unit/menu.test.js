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
  SET_NEW_PROJECT,
  setNewProject,
} from "../../state/stateMenu";

describe("Menu reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle TOGGLE_OBJECT_DETECTION", () => {
    // Action constant
    expect(TOGGLE_OBJECT_DETECTION).toEqual("TOGGLE_OBJECT_DETECTION");

    // Action creator without argument
    expect(toggleShowObjectDetection()).toEqual({
      type: TOGGLE_OBJECT_DETECTION,
      payload: false,
    });

    // Action creator with argument
    expect(toggleShowObjectDetection(true)).toEqual({
      type: TOGGLE_OBJECT_DETECTION,
      payload: true,
    });

    // Toggle from false to true
    expect(
      reducer(
        { ...initialState, showObjectDetection: false },
        {
          type: TOGGLE_OBJECT_DETECTION,
          payload: false,
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
          payload: false,
        }
      )
    ).toEqual({
      ...initialState,
      showObjectDetection: false,
    });

    // Toggle from false to true and set payload
    expect(
      reducer(
        { ...initialState, showObjectDetection: false },
        {
          type: TOGGLE_OBJECT_DETECTION,
          payload: true,
        }
      )
    ).toEqual({
      ...initialState,
      showObjectDetection: true,
      fromFolderManager: true,
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

  it("should handle SET_NEW_PROJECT", () => {
    // Action constant
    expect(SET_NEW_PROJECT).toEqual("SET_NEW_PROJECT");

    // Action creator
    expect(setNewProject()).toEqual({
      type: SET_NEW_PROJECT,
    });

    // Set to true
    expect(
      reducer(
        { ...initialState, newProject: false },
        {
          type: SET_NEW_PROJECT,
          payload: true,
        }
      )
    ).toEqual({
      ...initialState,
      newProject: true,
    });

    // Set to false
    expect(
      reducer(
        { ...initialState, newProject: true },
        {
          type: SET_NEW_PROJECT,
          payload: false,
        }
      )
    ).toEqual({
      ...initialState,
      newProject: false,
    });
  });
});
