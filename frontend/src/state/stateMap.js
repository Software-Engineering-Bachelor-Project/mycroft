import store from "./state";

/* -- CONSTANT -- */

/* -- ACTIONS -- */
export const SET_LOCATION = "SET_LOCATION";

/* -- INITIAL STATE -- */

export const initialState = {
  lat: 58.411,
  long: 15.621,
  zoom: 14,
};

/* -- ACTION CREATORS -- */

/**
 * This action is used to change the position of the map
 * @param {string} lat Should be one of the constants:
 * @param {string} long Should be one of the constants:
 * @param {string} zoom Should be one of the constants:
 */
export function setLocation(lat, long, zoom) {
  return {
    type: SET_LOCATION,
    lat: lat,
    long: long,
    zoom: zoom,
  };
}

/* -- REDUX REDUCER -- */
export const mapReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCATION:
      return {
        ...state,
        lat: action.lat,
        long: action.long,
        zoom: action.zoom,
      };
    default:
      return state;
  }
};

export default mapReducer;
