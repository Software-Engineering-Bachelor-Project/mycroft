/* -- THIS FILE TESTS THE TIMELINE COMPONENT -- */

// Reducer and initial state
import reducer, { initialState } from "../../state/stateTimeline";

// Import actions
import { ZOOM, zoom } from '../../state/stateTimeline';
import { SET_START_TIME, setStartTime } from '../../state/stateTimeline';
import { SET_END_TIME, setEndTime } from '../../state/stateTimeline';
import { SET_TIME_LIMITS, setTimeLimits } from '../../state/stateTimeline';
import { GB_SET_TIME_LIMITS, gbSetTimeLimits } from '../../state/stateTimeline';

import { getLinePlacements } from "../../components/timeline/timeline";

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
    var nextState = {
      ...initialState,
      scale: 24,
    };

    // Action constant
    expect(ZOOM).toEqual("ZOOM");

    // Action creator

    expect(zoom(24)).toEqual({
      type: ZOOM,
      hrs: 24,
    });

    // Change scale on timeline #1
    expect(
      reducer(
        { ...initialState },
        {
          type: ZOOM,
          hrs: 24,
        }
      )
    ).toEqual(nextState);

    // Change scale on timeline #2
    expect(
      reducer(nextState, {
        type: ZOOM,
        hrs: 36,
      })
    ).toEqual({
      ...initialState,
      scale: Math.min(36, timeSpanInHours),
    });

    // Change scale on timeline #3
    expect(
      reducer(nextState, {
        type: ZOOM,
        hrs: 720000,
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

  it("should handle SET_TMIE_LIMITS", () => {
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
    expect(SET_TIME_LIMITS).toEqual("SET_TIME_LIMITS");

    // Action creator
    expect(setTimeLimits(date2, date3)).toEqual({
      type: SET_TIME_LIMITS,
      start: date2,
      end: date3,
    });

    // Set startTime before endTime
    expect(
      reducer(
        { ...nextState },
        {
          type: SET_TIME_LIMITS,
          start: date1,
          end: date2,
        }
      )
    ).toEqual({
      ...nextState,
      startTime: date1,
      endTime: date2,
      timeSpan: date2.getTime() - date1.getTime(),
    });

    // Set startTime equal to endTime
    expect(
      reducer(nextState, {
        type: SET_TIME_LIMITS,
        start: date2,
        end: date2,
      })
    ).toEqual({
      ...nextState,
      startTime: date2,
      endTime: date2,
      timeSpan: date2.getTime() - date2.getTime(),
    });
});

    // Glassbox
    it('should handle GB_SET_TMIE_LIMITS', () => {
        // Setup variables
        var gbStartTimeBeforeTimeline = new Date(2020, 1, 1, 10, 0, 0);
        var gbEndTimeAfterTimeline = new Date(2020, 10, 16, 18, 0, 0);
        var timelineStartTime = new Date(2020, 3, 2, 10, 0, 0);
        var timelineEndTime = new Date(2020, 8, 15, 18, 0, 0);
        var gbStartTime = new Date(2020, 3, 5, 12, 0, 0);
        var gbEndTime = new Date(2020, 4, 12, 16, 0, 0);
        var timelineExpectedTimeSpan = timelineEndTime.getTime() - timelineStartTime.getTime();
        var gbExpectedTimeSpan = gbEndTime.getTime() - gbStartTime.getTime();
        var nextState = {
            ...initialState,
            startTime: timelineStartTime,
            endTime: timelineEndTime,
            timeSpan: timelineExpectedTimeSpan,
            glassbox: {
                startTime: gbStartTime,
                endTime: gbEndTime,
                timeSpan: gbExpectedTimeSpan
            }
        };

        
        // Action constant
        expect(GB_SET_TIME_LIMITS).toEqual("GB_SET_TIME_LIMITS");
        
        // Action creator
        expect(gbSetTimeLimits(gbStartTime, gbEndTime)).toEqual({
            type: GB_SET_TIME_LIMITS,
            start: gbStartTime,
            end: gbEndTime
        });

         // Set startTime before endTime
        expect(reducer({...nextState}, {
            type: GB_SET_TIME_LIMITS,
            start: gbStartTime,
            end: gbEndTime
        })).toEqual({
            ...nextState.glassbox,
            startTime: gbStartTime,
            endTime: gbEndTime,
            timeSpan: gbEndTime.getTime() - gbStartTime.getTime()
        });

        // Set startTime equal to endTime
        // Should throw console error
        expect(reducer(nextState, {
            type: GB_SET_TIME_LIMITS,
            start: gbStartTime,
            end: gbStartTime
        })).toEqual({
            ...nextState.glassbox,
            startTime: gbStartTime,
            endTime: gbStartTime,
            timeSpan: gbStartTime.getTime() - gbStartTime.getTime()
        });

        // Set startTime after endTime
        // Should throw console error
        expect(reducer(nextState, {
            type: GB_SET_TIME_LIMITS,
            start: gbEndTime,
            end: gbStartTime
        })).toEqual({
            ...nextState.glassbox,
            startTime: gbEndTime,
            endTime: gbStartTime,
            timeSpan: gbStartTime.getTime() - gbEndTime.getTime()
        });

        // Set startTime of glassbox before startTime of timeline
        // Should throw console error
        expect(reducer(nextState, {
            type: GB_SET_TIME_LIMITS,
            start: gbStartTimeBeforeTimeline,
            end: gbEndTime
        })).toEqual({
            ...nextState.glassbox,
            startTime: gbStartTimeBeforeTimeline,
            endTime: gbEndTime,
            timeSpan: gbEndTime.getTime() - gbStartTimeBeforeTimeline.getTime()
        });

        // Set endTime of glassbox after endTime of timeline
        // Should throw console error
        expect(reducer(nextState, {
            type: GB_SET_TIME_LIMITS,
            start: gbStartTime,
            end: gbEndTimeAfterTimeline
        })).toEqual({
            ...nextState.glassbox,
            startTime: gbStartTime,
            endTime: gbEndTimeAfterTimeline,
            timeSpan: gbEndTimeAfterTimeline.getTime() - gbStartTime.getTime()
        });

    });

    it('expect 9 console errors', () => {
        expect(console.error).toHaveBeenCalledTimes(9);
    });
});


describe('Timeline component', () => {
    // test getLinePlacements()
    it('should handle getLinePlacements', () => {
        // Setup variables
        const startTime1 = new Date(2020, 3, 12, 12, 20, 13); 
        const endTime1 = new Date(2020, 3, 12, 17, 20, 13);
        var timeSpan1 = endTime1.getTime() - startTime1.getTime();
        var expReturn1 = [
            "13.261111111111111%" ,
            "33.26111111111111%" ,
            "53.26111111111111%" ,
            "73.2611111111111%"
        ];

        const startTime2 = new Date(2020, 3, 11, 11, 10, 5); 
        const endTime2 = new Date(2020, 3, 12, 17, 20, 13);
        var timeSpan2 = endTime2.getTime() - startTime2.getTime();
        var expReturn2 = [
            "2.757623747790218%" ,
            "6.072296700058928%" ,
            "9.386969652327636%" ,
            "12.701642604596346%" ,
            "16.016315556865056%" ,
            "19.330988509133764%" ,
            "22.645661461402476%" ,
            "25.960334413671184%" ,
            "29.275007365939892%" ,
            "32.58968031820861%" ,
            "35.904353270477316%" ,
            "39.219026222746024%" ,
            "42.53369917501473%" ,
            "45.84837212728345%" ,
            "49.163045079552155%" ,
            "52.477718031820864%" ,
            "55.79239098408957%" ,
            "59.10706393635828%" ,
            "62.421736888626995%" ,
            "65.7364098408957%" ,
            "69.05108279316441%" ,
            "72.36575574543312%" ,
            "75.68042869770183%" ,
            "78.99510164997054%" ,
            "82.30977460223924%" ,
            "85.62444755450795%" ,
            "88.93912050677667%" ,
            "92.25379345904538%" ,
            "95.56846641131409%" ,
            "98.8831393635828%"
        ];

        const startTime3 = new Date(2020, 3, 10, 11, 10, 9); 
        const endTime3 = new Date(2020, 3, 19, 10, 20, 30);
        var timeSpan3 = endTime3.getTime() - startTime3.getTime();
        var expReturn3 =  [
            "0.3861243111147257%" ,
            "0.8508677146630416%" ,
            "1.3156111182113575%" ,
            "1.7803545217596732%" ,
            "2.2450979253079892%" ,
            "2.7098413288563052%" ,
            "3.174584732404621%" ,
            "3.639328135952937%" ,
            "4.104071539501252%" ,
            "4.568814943049568%" ,
            "5.033558346597884%" ,
            "5.4983017501462%" ,
            "5.963045153694516%" ,
            "6.427788557242831%" ,
            "6.892531960791147%" ,
            "7.357275364339463%" ,
            "7.822018767887779%" ,
            "8.286762171436095%" ,
            "8.751505574984412%" ,
            "9.216248978532727%" ,
            "9.680992382081044%" ,
            "10.145735785629359%" ,
            "10.610479189177674%" ,
            "11.075222592725991%" ,
            "11.539965996274306%" ,
            "12.004709399822623%" ,
            "12.469452803370938%" ,
            "12.934196206919253%" ,
            "13.39893961046757%" ,
            "13.863683014015885%" ,
            "14.328426417564202%" ,
            "14.793169821112517%" ,
            "15.257913224660832%" ,
            "15.72265662820915%" ,
            "16.187400031757463%" ,
            "16.652143435305778%" ,
            "17.116886838854096%" ,
            "17.58163024240241%" ,
            "18.046373645950727%" ,
            "18.511117049499042%" ,
            "18.975860453047357%" ,
            "19.440603856595676%" ,
            "19.90534726014399%" ,
            "20.370090663692306%" ,
            "20.83483406724062%" ,
            "21.299577470788936%" ,
            "21.764320874337255%" ,
            "22.22906427788557%" ,
            "22.693807681433885%" ,
            "23.1585510849822%" ,
            "23.623294488530515%" ,
            "24.088037892078834%" ,
            "24.55278129562715%" ,
            "25.017524699175464%" ,
            "25.48226810272378%" ,
            "25.947011506272094%" ,
            "26.411754909820413%" ,
            "26.876498313368728%" ,
            "27.341241716917043%" ,
            "27.80598512046536%" ,
            "28.270728524013673%" ,
            "28.735471927561992%" ,
            "29.200215331110307%" ,
            "29.664958734658622%" ,
            "30.129702138206937%" ,
            "30.594445541755253%" ,
            "31.05918894530357%" ,
            "31.523932348851886%" ,
            "31.988675752400205%" ,
            "32.45341915594852%" ,
            "32.918162559496835%" ,
            "33.38290596304515%" ,
            "33.847649366593465%" ,
            "34.312392770141784%" ,
            "34.777136173690096%" ,
            "35.241879577238414%" ,
            "35.706622980786726%" ,
            "36.171366384335045%" ,
            "36.63610978788336%" ,
            "37.100853191431675%" ,
            "37.56559659497999%" ,
            "38.030339998528305%" ,
            "38.495083402076624%" ,
            "38.95982680562494%" ,
            "39.424570209173254%" ,
            "39.88931361272157%" ,
            "40.354057016269884%" ,
            "40.8188004198182%" ,
            "41.28354382336652%" ,
            "41.74828722691483%" ,
            "42.21303063046315%" ,
            "42.67777403401146%" ,
            "43.14251743755978%" ,
            "43.6072608411081%" ,
            "44.07200424465641%" ,
            "44.53674764820473%" ,
            "45.00149105175304%" ,
            "45.46623445530136%" ,
            "45.93097785884968%" ,
            "46.39572126239799%" ,
            "46.86046466594631%" ,
            "47.32520806949462%" ,
            "47.78995147304294%" ,
            "48.25469487659126%" ,
            "48.71943828013957%" ,
            "49.18418168368789%" ,
            "49.6489250872362%" ,
            "50.11366849078452%" ,
            "50.57841189433284%" ,
            "51.04315529788115%" ,
            "51.50789870142947%" ,
            "51.97264210497778%" ,
            "52.4373855085261%" ,
            "52.90212891207442%" ,
            "53.36687231562273%" ,
            "53.83161571917105%" ,
            "54.29635912271936%" ,
            "54.76110252626768%" ,
            "55.225845929815996%" ,
            "55.69058933336431%" ,
            "56.15533273691263%" ,
            "56.62007614046094%" ,
            "57.08481954400926%" ,
            "57.549562947557575%" ,
            "58.01430635110589%" ,
            "58.479049754654206%" ,
            "58.94379315820252%" ,
            "59.408536561750836%" ,
            "59.873279965299155%" ,
            "60.338023368847466%" ,
            "60.802766772395785%" ,
            "61.267510175944096%" ,
            "61.732253579492415%" ,
            "62.196996983040734%" ,
            "62.661740386589045%" ,
            "63.126483790137364%" ,
            "63.591227193685675%" ,
            "64.05597059723401%" ,
            "64.52071400078232%" ,
            "64.98545740433063%" ,
            "65.45020080787894%" ,
            "65.91494421142727%" ,
            "66.37968761497558%" ,
            "66.84443101852389%" ,
            "67.30917442207222%" ,
            "67.77391782562053%" ,
            "68.23866122916884%" ,
            "68.70340463271717%" ,
            "69.16814803626548%" ,
            "69.63289143981379%" ,
            "70.0976348433621%" ,
            "70.56237824691043%" ,
            "71.02712165045874%" ,
            "71.49186505400705%" ,
            "71.95660845755538%" ,
            "72.42135186110369%" ,
            "72.886095264652%" ,
            "73.35083866820032%" ,
            "73.81558207174864%" ,
            "74.28032547529695%" ,
            "74.74506887884526%" ,
            "75.20981228239359%" ,
            "75.6745556859419%" ,
            "76.13929908949021%" ,
            "76.60404249303853%" ,
            "77.06878589658685%" ,
            "77.53352930013516%" ,
            "77.99827270368348%" ,
            "78.4630161072318%" ,
            "78.9277595107801%" ,
            "79.39250291432842%" ,
            "79.85724631787674%" ,
            "80.32198972142506%" ,
            "80.78673312497337%" ,
            "81.25147652852169%" ,
            "81.71621993207%" ,
            "82.18096333561832%" ,
            "82.64570673916664%" ,
            "83.11045014271495%" ,
            "83.57519354626326%" ,
            "84.03993694981158%" ,
            "84.5046803533599%" ,
            "84.96942375690821%" ,
            "85.43416716045652%" ,
            "85.89891056400485%" ,
            "86.36365396755316%" ,
            "86.82839737110147%" ,
            "87.2931407746498%" ,
            "87.75788417819811%" ,
            "88.22262758174642%" ,
            "88.68737098529473%" ,
            "89.15211438884306%" ,
            "89.61685779239137%" ,
            "90.08160119593968%" ,
            "90.54634459948801%" ,
            "91.01108800303632%" ,
            "91.47583140658463%" ,
            "91.94057481013296%" ,
            "92.40531821368127%" ,
            "92.87006161722958%" ,
            "93.33480502077789%" ,
            "93.79954842432622%" ,
            "94.26429182787453%" ,
            "94.72903523142284%" ,
            "95.19377863497117%" ,
            "95.65852203851948%" ,
            "96.12326544206779%" ,
            "96.58800884561612%" ,
            "97.05275224916443%" ,
            "97.51749565271274%" ,
            "97.98223905626105%" ,
            "98.44698245980938%" ,
            "98.91172586335769%" ,
            "99.376469266906%" ,
            "99.84121267045433%"
        ];
        
        const startTime4 = new Date(2020, 3, 10, 11, 10, 9);
        var timeSpan4 = 0.001*60*60*1000;
        var expReturn4 = [];

        
        // get list of line placements #1
        expect(getLinePlacements(startTime1, timeSpan1)).toEqual(expReturn1);

        // get list of line placements #2
        expect(getLinePlacements(startTime2, timeSpan2)).toEqual(expReturn2);

        // get list of line placements #3
        expect(getLinePlacements(startTime3, timeSpan3)).toEqual(expReturn3);

        // get list of line placements #4
        expect(getLinePlacements(startTime4, timeSpan4)).toEqual(expReturn4);
        
    });
});

