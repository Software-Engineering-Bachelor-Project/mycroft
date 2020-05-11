/* -- THIS FILE TESTS THE PLAYER COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateMap";

// Import actions
import { setLocation, SET_LOCATION } from "../../state/stateMap";

describe("Map reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle SET_LOCATION", () => {
    // Setup variables
    var lat = 1;
    var long = 1;
    var zoom = 1;

    var nextState = {
      ...initialState,
      lat: lat,
      long: long,
      zoom: zoom,
    };

    // Action constant
    expect(SET_LOCATION).toEqual("SET_LOCATION");

    // Action creator
    expect(setLocation(lat, long, zoom)).toEqual({
      type: SET_LOCATION,
      lat: lat,
      long: long,
      zoom: zoom,
    });

    // Set position
    expect(
      reducer(
        { ...initialState },
        {
          type: SET_LOCATION,
          lat: lat,
          long: long,
          zoom: zoom,
        }
      )
    ).toEqual(nextState);
  });
});
