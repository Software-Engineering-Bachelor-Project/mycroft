/* -- THIS FILE TESTS THE MAP COMPONENT -- */

// Import miscellaneous
import { Camera } from "../../types";

// TODO: mock Camera
/*jest.mock('../../types', () => {
    return {
        __esModule: true,
        Camera: jest.fn().mockImplementation(() => {
            return {
                
            };
        })
    };
});*/

// Reducer and initial state
import reducer, { initialState } from "../../state/stateMap";

// Import actions
import { ADD_CAMERA, addCamera } from "../../state/stateMap";
import { REMOVE_CAMERA, removeCamera } from "../../state/stateMap";

describe("Map reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle ADD_CAMERA", () => {
    // Setup variables
    var c1 = new Camera(3, "Test Name", [42, 69]);
    var c2 = new Camera(2, "Another Name", [420, 1337]);
    var nextState = {
      ...initialState,
      cameras: { 3: c1 },
    };

    // Action constant
    expect(ADD_CAMERA).toEqual("ADD_CAMERA");

    // Action creator
    expect(addCamera(c1)).toEqual({
      type: ADD_CAMERA,
      cam: c1,
    });

    // Add camera to dict
    expect(
      reducer(
        { ...initialState },
        {
          type: ADD_CAMERA,
          cam: c1,
        }
      )
    ).toEqual(nextState);

    // Add another camera to dict
    expect(
      reducer(nextState, {
        type: ADD_CAMERA,
        cam: c2,
      })
    ).toEqual({
      ...initialState,
      cameras: { 3: c1, 2: c2 },
    });
  });

  it("should handle REMOVE_CAMERA", () => {
    // Setup cameras
    var c1 = new Camera(3, "Test Name", [42, 69]);
    var c2 = new Camera(2, "Another Name", [420, 1337]);
    var testState = {
      ...initialState,
      cameras: { 3: c1, 2: c2 },
    };

    // Action constant
    expect(REMOVE_CAMERA).toEqual("REMOVE_CAMERA");

    // Action creator
    expect(removeCamera(3)).toEqual({
      type: REMOVE_CAMERA,
      id: 3,
    });

    // Remove camera
    expect(
      reducer(testState, {
        type: REMOVE_CAMERA,
        id: 3,
      })
    ).toEqual({
      ...initialState,
      cameras: { 2: c2 },
    });
  });
});
