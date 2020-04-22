import store from "./state";

/* -- ACTIONS -- */
export const ADD_CAMERA = "ADD_CAMERA";
export const REMOVE_CAMERA = "REMOVE_CAMERA";

/* -- INITIAL STATE -- */
export const initialState = {
  cameras: {},
};

/* -- ACTION CREATORS -- */
/**
 *
 * Creates an action used for adding a camera.
 *
 * @param {Camera} cam Camera to add.
 * @return {action} Action for adding a camera.
 */
export function addCamera(cam) {
  return {
    type: ADD_CAMERA,
    cam: cam,
  };
}

/**
 *
 * Creates an action used for removing a camera.
 *
 * @param {int} id Unique idenfitifier of a camera to remove.
 * @return {action} Action for removing a camera.
 */
export function removeCamera(id) {
  return {
    type: REMOVE_CAMERA,
    id: id,
  };
}

/* -- REDUX REDUCER -- */
const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_CAMERA:
      return {
        ...state,
        cameras: {
          ...state.cameras,
          [action.cam.id]: action.cam,
        },
      };
    case REMOVE_CAMERA:
      var cameras = { ...state.cameras };
      delete cameras[action.id];
      return {
        ...state,
        cameras: cameras,
      };
    default:
      return state;
  }
};

export default mapReducer;
