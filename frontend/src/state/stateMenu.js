import store from "./state";

/* -- ACTIONS -- */
const DUMMY = "DUMMY";

/* -- INITIAL STATE -- */
const initialState = {
  //TODO::add states
};

/* -- ACTION CREATORS -- */
export function dummy() {
  return {
    type: DUMMY,
  };
}

/* -- REDUX REDUCER -- */
const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case DUMMY:
      break;
    default:
      return state;
  }
};

export default menuReducer;
