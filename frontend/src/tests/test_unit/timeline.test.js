/* -- THIS FILE TESTS THE TIMELINE COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateTimeline";

// Import actions
import { ZOOM, zoom } from "../../state/stateTimeline";
import { SET_START_TIME, setStartTime } from "../../state/stateTimeline";
import { SET_END_TIME, setEndTime } from "../../state/stateTimeline";
import { SET_TIME_LIMITS, setTimeLimits } from "../../state/stateTimeline";
import { GB_SET_TIME_LIMITS, gbSetTimeLimits } from "../../state/stateTimeline";

//import constants
import { MAP_MODE, PLAYER_MODE } from "../../state/stateViewport";

// Mock the error function.
// This is used to count the number of expected errors.
console.error = jest.fn();

describe("Timeline reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle ZOOM", () => {
    // Setup variables
    var timeSpanInHours = initialState.timeSpan / (60 * 60 * 1000);
    var gbTimeSpanInHours = initialState.glassbox.timeSpan / (60 * 60 * 1000);
    var nextState = {
      ...initialState,
      scale: 24,
    };

    // Action constant
    expect(ZOOM).toEqual("ZOOM");

    // Action creator
    expect(zoom(24, MAP_MODE)).toEqual({
      type: ZOOM,
      hrs: 24,
      viewportMode: MAP_MODE,
    });

    // Change scale on timeline #1
    expect(
      reducer(
        { ...initialState },
        {
          type: ZOOM,
          hrs: 24,
          viewportMode: MAP_MODE,
        }
      )
    ).toEqual(nextState);

    // Change scale on timeline #2
    expect(
      reducer(nextState, {
        type: ZOOM,
        hrs: 36,
        viewportMode: PLAYER_MODE,
      })
    ).toEqual({
      ...initialState,
      scale: Math.min(36, gbTimeSpanInHours),
    });

    // Change scale on timeline #3
    expect(
      reducer(nextState, {
        type: ZOOM,
        hrs: 720000,
        viewportMode: MAP_MODE,
      })
    ).toEqual({
      ...initialState,
      scale: Math.min(720000, timeSpanInHours),
    });

    // Change scale on timeline #3
    expect(
      reducer(nextState, {
        type: ZOOM,
        hrs: 0.0001,
        viewportMode: MAP_MODE,
      })
    ).toEqual({
      ...initialState,
      scale: Math.min(0.0001, timeSpanInHours),
    });
  });

  it("should handle SET_START_TIME", () => {
    // Setup variables
    var date1 = new Date(2020, 3, 5, 12, 0, 0);
    var date2 = new Date(2020, 4, 12, 16, 0, 0);
    var date3 = new Date(2020, 4, 12, 18, 0, 0);
    var date4 = new Date(2020, 7, 20, 18, 0, 0);
    var expectedTimeSpan = date3.getTime() - date1.getTime();
    var nextState = {
      ...initialState,
      startTime: date1,
      endTime: date3,
      timeSpan: expectedTimeSpan,
    };

    // Action constant
    expect(SET_START_TIME).toEqual("SET_START_TIME");

    // Action creator
    expect(setStartTime(date1)).toEqual({
      type: SET_START_TIME,
      date: date1,
    });

    // Set startTime before endTime
    expect(
      reducer(
        { ...nextState },
        {
          type: SET_START_TIME,
          date: date2,
        }
      )
    ).toEqual({
      ...nextState,
      startTime: date2,
      timeSpan: nextState.endTime.getTime() - date2.getTime(),
    });

    // Set startTime on endTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: SET_START_TIME,
        date: date3,
      })
    ).toEqual({
      ...nextState,
      startTime: date3,
      timeSpan: nextState.endTime.getTime() - date3.getTime(),
    });

    // Set startTime after endTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: SET_START_TIME,
        date: date4,
      })
    ).toEqual({
      ...nextState,
      startTime: date4,
      timeSpan: nextState.endTime.getTime() - date4.getTime(),
    });
  });

  it("expect 2 console errors", () => {
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("should handle SET_END_TIME", () => {
    // Setup variables
    var date1 = new Date(2020, 3, 5, 12, 0, 0);
    var date2 = new Date(2020, 4, 12, 16, 0, 0);
    var date3 = new Date(2020, 4, 12, 18, 0, 0);
    var date4 = new Date(2020, 7, 20, 18, 0, 0);
    var expectedTimeSpan = date3.getTime() - date2.getTime();
    var nextState = {
      ...initialState,
      startTime: date2,
      endTime: date3,
      timeSpan: expectedTimeSpan,
    };

    // Action constant
    expect(SET_END_TIME).toEqual("SET_END_TIME");

    // Action creator
    expect(setEndTime(date3)).toEqual({
      type: SET_END_TIME,
      date: date3,
    });

    // Set endTime after startTime
    expect(
      reducer(
        { ...nextState },
        {
          type: SET_END_TIME,
          date: date4,
        }
      )
    ).toEqual({
      ...nextState,
      endTime: date4,
      timeSpan: date4.getTime() - nextState.startTime.getTime(),
    });

    // Set endTime on startTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: SET_END_TIME,
        date: date2,
      })
    ).toEqual({
      ...nextState,
      endTime: date2,
      timeSpan: date2.getTime() - nextState.startTime.getTime(),
    });

    // Set endTime before startTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: SET_END_TIME,
        date: date1,
      })
    ).toEqual({
      ...nextState,
      endTime: date1,
      timeSpan: date1.getTime() - nextState.startTime.getTime(),
    });
  });

  // 2 from SET_START_TIME
  it("expect 4 console errors", () => {
    expect(console.error).toHaveBeenCalledTimes(4);
  });

  it("should handle SET_TMIE_LIMITS", () => {
    // Setup variables
    var date1 = new Date(2020, 2, 5, 12, 0, 0);
    var date2 = new Date(2020, 3, 12, 16, 0, 0);
    var date3 = new Date(2020, 4, 3, 12, 0, 0);
    var date4 = new Date(2020, 4, 5, 18, 30, 0);
    var date5 = new Date(2020, 5, 12, 18, 0, 0);
    var date6 = new Date(2020, 7, 20, 18, 0, 0);

    var expectedTimeSpan = date3.getTime() - date2.getTime();
    var gbExpectedTimeSpan = date4.getTime() - date3.getTime();
    var nextState = {
      ...initialState,
      startTime: date2,
      endTime: date3,
      timeSpan: expectedTimeSpan,

      glassbox: {
        ...initialState.glassbox,
        startTime: date3,
        endTime: date4,
        timeSpan: gbExpectedTimeSpan,
      },
    };

    // Action constant
    expect(SET_TIME_LIMITS).toEqual("SET_TIME_LIMITS");

    // Action creator
    // Should throw console error
    expect(setTimeLimits(date2, date5, undefined, undefined)).toEqual({
      type: SET_TIME_LIMITS,
      start: date2,
      end: date5,
      gbStart: undefined,
      gbEnd: undefined,
    });

    // Set startTime before endTime
    expect(
      reducer(
        { ...nextState },
        {
          type: SET_TIME_LIMITS,
          start: date1,
          end: date5,
          gbStart: undefined,
          gbEnd: undefined,
        }
      )
    ).toEqual({
      ...nextState,
      startTime: date1,
      endTime: date5,
      timeSpan: date5.getTime() - date1.getTime(),

      glassbox: {
        ...initialState.glassbox,
        startTime: date3,
        endTime: date4,
        timeSpan: gbExpectedTimeSpan,
      },
    });

    // Set startTime equal to endTime
    // Should throw 2 console errors
    expect(
      reducer(nextState, {
        type: SET_TIME_LIMITS,
        start: date2,
        end: date2,
        gbStart: date2,
        gbEnd: date2,
      })
    ).toEqual({
      ...nextState,
      startTime: date2,
      endTime: date2,
      timeSpan: date2.getTime() - date2.getTime(),

      glassbox: {
        ...initialState.glassbox,
        startTime: date2,
        endTime: date2,
        timeSpan: 0,
      },
    });

    // Set startTime after endTime
    // Should throw 2 console errors
    expect(
      reducer(nextState, {
        type: SET_TIME_LIMITS,
        start: date4,
        end: date1,
        gbStart: date2,
        gbEnd: date3,
      })
    ).toEqual({
      ...nextState,
      startTime: date4,
      endTime: date1,
      timeSpan: date1.getTime() - date4.getTime(),

      glassbox: {
        ...initialState.glassbox,
        startTime: date2,
        endTime: date3,
        timeSpan: date3.getTime() - date2.getTime(),
      },
    });
  });

  // 2 from SET_START_TIME
  // 2 from SET_END_TIME
  it("expect 9 console errors", () => {
    expect(console.error).toHaveBeenCalledTimes(9);
  });

  // Glassbox
  it("should handle GB_SET_TMIE_LIMITS", () => {
    // Setup variables
    var gbStartTimeBeforeTimeline = new Date(2020, 1, 1, 10, 0, 0);
    var gbEndTimeAfterTimeline = new Date(2020, 10, 16, 18, 0, 0);
    var timelineStartTime = new Date(2020, 3, 2, 10, 0, 0);
    var timelineEndTime = new Date(2020, 8, 15, 18, 0, 0);
    var gbStartTime = new Date(2020, 3, 5, 12, 0, 0);
    var gbEndTime = new Date(2020, 4, 12, 16, 0, 0);
    var timelineExpectedTimeSpan =
      timelineEndTime.getTime() - timelineStartTime.getTime();
    var gbExpectedTimeSpan = gbEndTime.getTime() - gbStartTime.getTime();
    var nextState = {
      ...initialState,
      startTime: timelineStartTime,
      endTime: timelineEndTime,
      timeSpan: timelineExpectedTimeSpan,

      glassbox: {
        ...initialState.glassbox,
        startTime: gbStartTime,
        endTime: gbEndTime,
        timeSpan: gbExpectedTimeSpan,
      },
    };

    // Action constant
    expect(GB_SET_TIME_LIMITS).toEqual("GB_SET_TIME_LIMITS");

    // Action creator
    expect(gbSetTimeLimits(gbStartTime, gbEndTime)).toEqual({
      type: GB_SET_TIME_LIMITS,
      gbStart: gbStartTime,
      gbEnd: gbEndTime,
    });

    // Set startTime before endTime
    expect(
      reducer(
        { ...nextState },
        {
          type: GB_SET_TIME_LIMITS,
          gbStart: gbStartTime,
          gbEnd: gbEndTime,
        }
      )
    ).toEqual({
      ...nextState,
      glassbox: {
        ...initialState.glassbox,
        startTime: gbStartTime,
        endTime: gbEndTime,
        timeSpan: gbEndTime.getTime() - gbStartTime.getTime(),
      },
    });

    // Set startTime equal to endTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: GB_SET_TIME_LIMITS,
        gbStart: gbStartTime,
        gbEnd: gbStartTime,
      })
    ).toEqual({
      ...nextState,
      glassbox: {
        ...initialState.glassbox,
        startTime: gbStartTime,
        endTime: gbStartTime,
        timeSpan: gbStartTime.getTime() - gbStartTime.getTime(),
      },
    });

    // Set startTime after endTime
    // Should throw console error
    expect(
      reducer(nextState, {
        type: GB_SET_TIME_LIMITS,
        gbStart: gbEndTime,
        gbEnd: gbStartTime,
      })
    ).toEqual({
      ...nextState,
      glassbox: {
        ...initialState.glassbox,
        startTime: gbEndTime,
        endTime: gbStartTime,
        timeSpan: gbStartTime.getTime() - gbEndTime.getTime(),
      },
    });

    // Set startTime of glassbox before startTime of timeline
    // Should throw console error
    expect(
      reducer(nextState, {
        type: GB_SET_TIME_LIMITS,
        gbStart: gbStartTimeBeforeTimeline,
        gbEnd: gbEndTime,
      })
    ).toEqual({
      ...nextState,
      glassbox: {
        ...initialState.glassbox,
        startTime: gbStartTimeBeforeTimeline,
        endTime: gbEndTime,
        timeSpan: gbEndTime.getTime() - gbStartTimeBeforeTimeline.getTime(),
      },
    });

    // Set endTime of glassbox after endTime of timeline
    // Should throw console error
    expect(
      reducer(nextState, {
        type: GB_SET_TIME_LIMITS,
        gbStart: gbStartTime,
        gbEnd: gbEndTimeAfterTimeline,
      })
    ).toEqual({
      ...nextState,
      glassbox: {
        ...initialState.glassbox,
        startTime: gbStartTime,
        endTime: gbEndTimeAfterTimeline,
        timeSpan: gbEndTimeAfterTimeline.getTime() - gbStartTime.getTime(),
      },
    });
  });

  // 2 from SET_START_TIME
  // 2 from SET_END_TIME
  // 5 from SET_TIME_LIMITS
  it("expect 13 console errors", () => {
    expect(console.error).toHaveBeenCalledTimes(13);
  });
});
