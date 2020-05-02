/* -- THIS FILE TESTS THE COMMUNICATION STATE FILE .. */

// Misc
import { Project, Folder, Camera, Clip, Area, Resolution } from "../../types";
import { TARGET } from "../../state/stateObjectDetector";

// Reducer and initial state
import reducer, { initialState } from "../../state/stateCommunication";

// Import actions
import {
  REQUEST_RESPONSE,
  requestResponse,
} from "../../state/stateCommunication";
import { OPEN_PROJECT, openProject } from "../../state/stateCommunication";
import {
  GET_CLIPS_MATCHING_FILTER,
  getClipsMatchingFilter,
} from "../../state/stateCommunication";
import { MODIFY_FILTER, modifyFilter } from "../../state/stateCommunication";
import {
  GET_AREAS_IN_FILTER,
  getAreasInFilter,
} from "../../state/stateCommunication";
import { CREATE_AREA, createArea } from "../../state/stateCommunication";
import { DELETE_AREA, deleteArea } from "../../state/stateCommunication";
import {
  GET_FILTER_PARAMS,
  getFilterParams,
} from "../../state/stateCommunication";
import { GET_PROJECTS, getProjects } from "../../state/stateCommunication";
import { NEW_PROJECT, newProject } from "../../state/stateCommunication";
import { DELETE_PROJECT, deleteProject } from "../../state/stateCommunication";
import { RENAME_PROJECT, renameProject } from "../../state/stateCommunication";
import { GET_FOLDERS, getFolders } from "../../state/stateCommunication";
import {
  GET_SOURCE_FOLDERS,
  getSourceFolders,
} from "../../state/stateCommunication";
import { ADD_FOLDER, addFolder } from "../../state/stateCommunication";
import { REMOVE_FOLDER, removeFolder } from "../../state/stateCommunication";
import { GET_CLIPS, getClips } from "../../state/stateCommunication";
import { GET_CAMERAS, getCameras } from "../../state/stateCommunication";
import {
  GET_SEQUENTIAL_CLIP,
  getSequentialClip,
} from "../../state/stateCommunication";
import { DETECT_OBJECTS, detectObjects } from "../../state/stateCommunication";
import { GET_OD_PROGRESS, getODProgress } from "../../state/stateCommunication";
import {
  DELETE_OD_PROGRESS,
  deleteODProgress,
} from "../../state/stateCommunication";

describe("Communication reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle REQUEST_RESPONSE", () => {
    // Action constant
    expect(REQUEST_RESPONSE).toEqual("REQUEST_RESPONSE");

    // Action creator
    expect(
      requestResponse("test_type", 404, {
        test: 4,
      })
    ).toEqual({
      type: REQUEST_RESPONSE,
      reqType: "test_type",
      status: 404,
      data: {
        test: 4,
      },
    });

    // Receival of specific request types will be
    // handled in their respective request action.
  });

  it("should handle OPEN_PROJECT", () => {
    let tempDate = new Date(2020, 1, 1, 3, 24, 0);
    let testState = {
      ...initialState,
      projects: {
        69: new Project(69, "p1", tempDate, tempDate, [], 39),
        1337: new Project(1337, "p2", tempDate, tempDate, [], 42),
      },
    };

    // Action constant
    expect(OPEN_PROJECT).toEqual("OPEN_PROJECT");

    // Action creator
    expect(openProject(69)).toEqual({
      type: OPEN_PROJECT,
      id: 69,
    });

    // Open project from undefined
    expect(
      reducer(
        {
          ...testState,
          projectID: -1,
        },
        openProject(69)
      )
    ).toEqual({
      ...testState,
      projectID: 69,
      filter: {
        ...testState.filter,
        filterID: 39,
      },
    });

    // Open project from valid
    expect(
      reducer(
        {
          ...testState,
          projectID: 69,
          filter: {
            ...testState.filter,
            filterID: 39,
          },
        },
        openProject(1337)
      )
    ).toEqual({
      ...testState,
      projectID: 1337,
      filter: {
        ...testState.filter,
        filterID: 42,
      },
    });
  });

  it("should handle GET_CLIPS_MATCHING_FILTER", () => {
    // Action constant
    expect(GET_CLIPS_MATCHING_FILTER).toEqual("GET_CLIPS_MATCHING_FILTER");

    // Action creator
    expect(getClipsMatchingFilter()).toEqual({
      type: GET_CLIPS_MATCHING_FILTER,
    });
  });

  it("should handle MODIFY_FILTER", () => {
    // Action constant
    expect(MODIFY_FILTER).toEqual("MODIFY_FILTER");

    // Action creator
    expect(modifyFilter()).toEqual({
      type: MODIFY_FILTER,
    });

    // Modify filter
    expect(
      reducer(initialState, requestResponse(MODIFY_FILTER, 200, {}))
    ).toEqual(initialState);

    // 204
    expect(
      reducer(initialState, requestResponse(MODIFY_FILTER, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(MODIFY_FILTER, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(MODIFY_FILTER, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_AREAS_IN_FILTER", () => {
    // Declare variables
    let testArea = new Area("10.10", "-42.99", 42);

    // Action constant
    expect(GET_AREAS_IN_FILTER).toEqual("GET_AREAS_IN_FILTER");

    // Action creator
    expect(getAreasInFilter()).toEqual({
      type: GET_AREAS_IN_FILTER,
    });

    // Get areas in filter (empty)
    expect(
      reducer(
        initialState,
        requestResponse(GET_AREAS_IN_FILTER, 200, { areas: [] })
      )
    ).toEqual(initialState);

    // Get areas in filter (empty)
    expect(
      reducer(
        initialState,
        requestResponse(GET_AREAS_IN_FILTER, 200, {
          areas: [
            {
              id: 1337,
              latitude: "10.10",
              longitude: "-42.99",
              radius: 42,
            },
          ],
        })
      )
    ).toEqual({
      ...initialState,
      filter: {
        ...initialState.filter,
        areas: { 1337: testArea },
      },
    });

    // 204
    expect(
      reducer(
        initialState,
        requestResponse(GET_AREAS_IN_FILTER, 204, undefined)
      )
    ).toEqual(initialState);

    // 400
    expect(
      reducer(
        initialState,
        requestResponse(GET_AREAS_IN_FILTER, 400, undefined)
      )
    ).toEqual(initialState);

    // 404
    expect(
      reducer(
        initialState,
        requestResponse(GET_AREAS_IN_FILTER, 404, undefined)
      )
    ).toEqual(initialState);
  });

  it("should handle CREATE_AREA", () => {
    // Declare variables
    let testArea = new Area("10.10", "-42.99", 42);

    // Action constant
    expect(CREATE_AREA).toEqual("CREATE_AREA");

    // Action creator
    expect(createArea()).toEqual({
      type: CREATE_AREA,
    });

    // Create area
    expect(
      reducer(
        initialState,
        requestResponse(CREATE_AREA, 200, {
          area: {
            id: 1337,
            latitude: "10.10",
            longitude: "-42.99",
            radius: 42,
          },
        })
      )
    ).toEqual({
      ...initialState,
      filter: {
        ...initialState.filter,
        areas: { 1337: testArea },
      },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(CREATE_AREA, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(CREATE_AREA, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(CREATE_AREA, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle DELETE_AREA", () => {
    // Declare variables
    let testArea = new Area("10.10", "-42.99", 42);

    // Action constant
    expect(DELETE_AREA).toEqual("DELETE_AREA");

    // Action creator
    expect(deleteArea()).toEqual({
      type: DELETE_AREA,
    });

    // Delete area
    expect(
      reducer(
        {
          ...initialState,
          filter: {
            ...initialState.filter,
            areas: { 1337: testArea },
          },
        },
        requestResponse(DELETE_AREA, 200, {
          area_id: 1337,
        })
      )
    ).toEqual({
      ...initialState,
      filter: {
        ...initialState.filter,
        areas: {},
      },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(DELETE_AREA, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(DELETE_AREA, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(DELETE_AREA, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_FILTER_PARAMS", () => {
    // Action constant
    expect(GET_FILTER_PARAMS).toEqual("GET_FILTER_PARAMS");

    // Action creator
    expect(getFilterParams()).toEqual({
      type: GET_FILTER_PARAMS,
    });
  });

  it("should handle GET_PROJECTS", () => {
    // Set up variables
    var data1 = {
      projects: [
        {
          id: 4,
          filter_set: [1337],
          name: "test proj 1",
          created: "datetime1",
          last_updated: "datetime2",
          folders: [5, 7, 8],
        },
        {
          id: 69,
          filter_set: [42],
          name: "test proj 2",
          created: "datetime3",
          last_updated: "datetime4",
          folders: [],
        },
      ],
    };

    var data2 = {
      projects: [
        {
          id: 1337,
          filter_set: [39],
          name: "test proj 3",
          created: "datetime5",
          last_updated: "datetime6",
          folders: [500, 725, 1016],
        },
      ],
    };

    var dict1 = {
      4: new Project(
        4,
        "test proj 1",
        "datetime1",
        "datetime2",
        [5, 7, 8],
        1337
      ),
      69: new Project(69, "test proj 2", "datetime3", "datetime4", [], 42),
    };

    var dict2 = {
      1337: new Project(
        1337,
        "test proj 3",
        "datetime5",
        "datetime6",
        [500, 725, 1016],
        39
      ),
    };

    // Action constant
    expect(GET_PROJECTS).toEqual("GET_PROJECTS");

    // Action creator
    expect(getProjects()).toEqual({
      type: GET_PROJECTS,
    });

    // Fetch project list
    expect(
      reducer(initialState, requestResponse(GET_PROJECTS, 200, data1))
    ).toEqual({
      ...initialState,
      projects: dict1,
    });

    // Update list
    expect(
      reducer(
        {
          ...initialState,
          projects: dict1,
        },
        requestResponse(GET_PROJECTS, 200, data2)
      )
    ).toEqual({
      ...initialState,
      projects: dict2,
    });

    // 404
    expect(
      reducer(initialState, requestResponse(GET_PROJECTS, 404, data1))
    ).toEqual(initialState);
  });

  it("should handle NEW_PROJECT", () => {
    // Action constant
    expect(NEW_PROJECT).toEqual("NEW_PROJECT");

    // Action creator
    expect(newProject("test name")).toEqual({
      type: NEW_PROJECT,
      name: "test name",
    });

    // Create new project
    expect(
      reducer(
        initialState,
        requestResponse(NEW_PROJECT, 200, {
          project_id: 7,
        })
      )
    ).toEqual({
      ...initialState,
      projectID: 7,
    });

    // 400
    expect(
      reducer(initialState, requestResponse(NEW_PROJECT, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(NEW_PROJECT, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle DELETE_PROJECT", () => {
    // Action constant
    expect(DELETE_PROJECT).toEqual("DELETE_PROJECT");

    // Action creator
    expect(deleteProject(1337)).toEqual({
      type: DELETE_PROJECT,
      id: 1337,
    });

    // Delete project
    expect(
      reducer(initialState, requestResponse(DELETE_PROJECT, 200, {}))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(DELETE_PROJECT, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(DELETE_PROJECT, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle RENAME_PROJECT", () => {
    // Action constant
    expect(RENAME_PROJECT).toEqual("RENAME_PROJECT");

    // Action creator
    expect(renameProject(1337)).toEqual({
      type: RENAME_PROJECT,
      id: 1337,
    });

    // Rename project
    expect(
      reducer(initialState, requestResponse(RENAME_PROJECT, 200, {}))
    ).toEqual(initialState);

    // 204
    expect(
      reducer(initialState, requestResponse(RENAME_PROJECT, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(RENAME_PROJECT, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(RENAME_PROJECT, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_CAMERAS", () => {
    // Declare variables
    let one_camera = [
      {
        id: 42,
        clip_set: [1, 4, 5],
        name: "camera_name",
        latitude: "59.38866800",
        longitude: "17.92650100",
        start_time: "2018-09-06T16:45:59+02:00",
        end_time: "2018-09-06T16:46:50+02:00",
      },
    ];
    // Action constant
    expect(GET_CAMERAS).toEqual("GET_CAMERAS");

    // Action creator
    expect(getCameras()).toEqual({
      type: GET_CAMERAS,
    });

    // Get cameras
    expect(
      reducer(
        initialState,
        requestResponse(GET_CAMERAS, 200, { cameras: one_camera })
      )
    ).toEqual({
      ...initialState,
      cameras: {
        42: new Camera(
          42,
          "camera_name",
          {
            latitude: "59.38866800",
            longitude: "17.92650100",
          },
          [1, 4, 5]
        ),
      },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(GET_CAMERAS, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(GET_CAMERAS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(GET_CAMERAS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_SEQUENTIAL_CLIP", () => {
    // Action constant
    expect(GET_SEQUENTIAL_CLIP).toEqual("GET_SEQUENTIAL_CLIP");

    // Action creator
    expect(getSequentialClip(42)).toEqual({
      type: GET_SEQUENTIAL_CLIP,
      cid: 42,
    });

    // Get existing sequential clip
    expect(
      reducer(
        initialState,
        requestResponse(GET_SEQUENTIAL_CLIP, 200, { clip_id: 42 })
      )
    ).toEqual({
      ...initialState,
      player: { ...initialState.player, nextClip: 42 },
    });

    // Get non existing sequential clip
    expect(
      reducer(
        initialState,
        requestResponse(GET_SEQUENTIAL_CLIP, 200, { clip_id: null })
      )
    ).toEqual(initialState);

    // 204
    expect(
      reducer(
        initialState,
        requestResponse(GET_SEQUENTIAL_CLIP, 204, undefined)
      )
    ).toEqual(initialState);

    // 400
    expect(
      reducer(
        initialState,
        requestResponse(GET_SEQUENTIAL_CLIP, 400, undefined)
      )
    ).toEqual(initialState);

    // 404
    expect(
      reducer(
        initialState,
        requestResponse(GET_SEQUENTIAL_CLIP, 404, undefined)
      )
    ).toEqual(initialState);
  });

  it("should handle GET_FOLDERS", () => {
    // Declare variables
    let testState = { ...initialState, projectID: 42 };

    // Action constant
    expect(GET_FOLDERS).toEqual("GET_FOLDERS");

    // Action creator
    expect(getFolders()).toEqual({
      type: GET_FOLDERS,
    });

    // Get folders
    expect(
      reducer(
        testState,
        requestResponse(GET_FOLDERS, 200, {
          folders: [
            {
              id: 42,
              clip_set: [1337, 21],
              path: "home/user/",
              name: "test_folder",
              parent: null,
            },
          ],
        })
      )
    ).toEqual({
      ...testState,
      folders: {
        42: new Folder(42, "test_folder", undefined, [], [1337, 21]),
      },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(GET_FOLDERS, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(GET_FOLDERS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(GET_FOLDERS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_SOURCE_FOLDERS", () => {
    // Action constant
    expect(GET_SOURCE_FOLDERS).toEqual("GET_SOURCE_FOLDERS");

    // Action creator
    expect(getSourceFolders()).toEqual({
      type: GET_SOURCE_FOLDERS,
    });

    // Get source folders
    expect(
      reducer(
        initialState,
        requestResponse(GET_SOURCE_FOLDERS, 200, {
          folders: [
            {
              id: 42,
              clip_set: [1337, 21],
              path: "home/user/",
              name: "test_folder",
              parent: null,
            },
          ],
        })
      )
    ).toEqual({
      ...initialState,
      sourceFolders: {
        42: new Folder(42, "test_folder", undefined, [], [1337, 21]),
      },
    });

    // 404
    expect(
      reducer(initialState, requestResponse(GET_SOURCE_FOLDERS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle ADD_FOLDER", () => {
    // Action constant
    expect(ADD_FOLDER).toEqual("ADD_FOLDER");

    // Action creator
    expect(addFolder()).toEqual({
      type: ADD_FOLDER,
    });

    // Add folder
    expect(
      reducer(initialState, requestResponse(ADD_FOLDER, 200, { folder_id: 42 }))
    ).toEqual(initialState);

    // 204
    expect(
      reducer(initialState, requestResponse(ADD_FOLDER, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(ADD_FOLDER, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(ADD_FOLDER, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle REMOVE_FOLDER", () => {
    // Action constant
    expect(REMOVE_FOLDER).toEqual("REMOVE_FOLDER");

    // Action creator
    expect(removeFolder()).toEqual({
      type: REMOVE_FOLDER,
    });

    // Remove folder
    expect(
      reducer(
        initialState,
        requestResponse(REMOVE_FOLDER, 200, { folder_id: 42 })
      )
    ).toEqual(initialState);

    // 204
    expect(
      reducer(initialState, requestResponse(REMOVE_FOLDER, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(REMOVE_FOLDER, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(REMOVE_FOLDER, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_CLIPS", () => {
    // Declare variables
    let tempResolution = new Resolution(1920, 1080);
    let testState = {
      ...initialState,
      projectID: 42,
      filter: { ...initialState.filter, resolutions: { 1: tempResolution } },
    };

    let tempStartDate = new Date("2018-09-06T16:45:59+02:00");
    let tempEndDate = new Date("2018-09-06T16:46:50+02:00");

    // Action constant
    expect(GET_CLIPS).toEqual("GET_CLIPS");

    // Action creator
    expect(getClips()).toEqual({
      type: GET_CLIPS,
    });

    // Get clips
    expect(
      reducer(
        testState,
        requestResponse(GET_CLIPS, 200, {
          clips: [
            {
              id: 42,
              name: "test_clip",
              video_format: "avi",
              start_time: "2018-09-06T16:45:59+02:00",
              end_time: "2018-09-06T16:46:50+02:00",
              frame_rate: 24.0,
              hash_sum: null,
              folder: 1,
              camera: 1,
              resolution: 1,
              duplicates: [6],
              overlap: [4, 5],
            },
          ],
        })
      )
    ).toEqual({
      ...testState,
      clips: {
        42: new Clip(
          42,
          "test_clip",
          1,
          1,
          "avi",
          tempStartDate,
          tempEndDate,
          tempResolution,
          [6],
          [4, 5]
        ),
      },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(GET_CLIPS, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(GET_CLIPS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(GET_CLIPS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle DETECT_OBJECTS", () => {
    // Action constant
    expect(DETECT_OBJECTS).toEqual("DETECT_OBJECTS");

    // Action creator
    expect(detectObjects(42, TARGET.PROJECT)).toEqual({
      type: DETECT_OBJECTS,
      rate: 42,
      target: TARGET.PROJECT,
    });

    // Object detection
    expect(
      reducer(
        initialState,
        requestResponse(DETECT_OBJECTS, 200, { progress_id: 42 })
      )
    ).toEqual({
      ...initialState,
      od: { ...initialState.od, progressID: 42 },
    });

    // 400
    expect(
      reducer(initialState, requestResponse(DETECT_OBJECTS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(DETECT_OBJECTS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle GET_OD_PROGRESS", () => {
    // Action constant
    expect(GET_OD_PROGRESS).toEqual("GET_OD_PROGRESS");

    // Action creator
    expect(getODProgress()).toEqual({
      type: GET_OD_PROGRESS,
    });

    // Get od progress
    expect(
      reducer(
        initialState,
        requestResponse(GET_OD_PROGRESS, 200, { total: 1337, current: 42 })
      )
    ).toEqual({
      ...initialState,
      od: { ...initialState.od, currentProgress: 3 },
    });

    // Get od progress of zero clips
    expect(
      reducer(
        initialState,
        requestResponse(GET_OD_PROGRESS, 200, { total: 0, current: 0 })
      )
    ).toEqual({
      ...initialState,
      od: { ...initialState.od, currentProgress: 100 },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(GET_OD_PROGRESS, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(GET_OD_PROGRESS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(GET_OD_PROGRESS, 404, undefined))
    ).toEqual(initialState);
  });

  it("should handle DELETE_OD_PROGRESS", () => {
    // Action constant
    expect(DELETE_OD_PROGRESS).toEqual("DELETE_OD_PROGRESS");

    // Action creator
    expect(deleteODProgress()).toEqual({
      type: DELETE_OD_PROGRESS,
    });

    // Delete od progress, check that progress and id is reset
    expect(
      reducer(initialState, requestResponse(DELETE_OD_PROGRESS, 200, {}))
    ).toEqual({
      ...initialState,
      od: { ...initialState.od, progressID: -1, currentProgress: 0 },
    });

    // 204
    expect(
      reducer(initialState, requestResponse(DELETE_OD_PROGRESS, 204, undefined))
    ).toEqual(initialState);

    // 400
    expect(
      reducer(initialState, requestResponse(DELETE_OD_PROGRESS, 400, undefined))
    ).toEqual(initialState);

    // 404
    expect(
      reducer(initialState, requestResponse(DELETE_OD_PROGRESS, 404, undefined))
    ).toEqual(initialState);
  });
});
