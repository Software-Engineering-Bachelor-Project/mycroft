/* -- THIS FILE TESTS THE UTIL FILE .. */

import { Folder } from "../../types";
import {
  parseFolders,
  START_TIME,
  END_TIME,
  MIN_FRAME_RATE,
  WHITELISTED_RESOLUTIONS,
  INCLUDED_CLIP_IDS,
  EXCLUDED_CLIP_IDS,
  OBJECTS,
} from "../../util";

describe("parseFolders", () => {
  it("should handle single folder", () => {
    let single = [
      {
        id: 42,
        clip_set: [1337, 21],
        path: "home/user/",
        name: "test_folder",
        parent: null,
      },
    ];
    expect(parseFolders(single)).toEqual({
      42: new Folder(42, "test_folder", undefined, [], [1337, 21]),
    });
  });

  it("should handle empty lists", () => {
    expect(parseFolders([])).toEqual({});
  });

  it("should handle multiple levels", () => {
    let multipleLevels = [
      {
        id: 1337,
        clip_set: [22],
        path: "home/user/test_folder/",
        name: "test_folder1",
        parent: 42,
      },
      {
        id: 7331,
        clip_set: [23],
        path: "home/user/test_folder/",
        name: "test_folder2",
        parent: 42,
      },
      {
        id: 21,
        clip_set: [12],
        path: "home/user/test_folder/test_folder1/",
        name: "test_folder3",
        parent: 1337,
      },
      {
        id: 42,
        clip_set: [1337, 21],
        path: "home/user/",
        name: "test_folder",
        parent: undefined,
      },
    ];
    expect(parseFolders(multipleLevels)).toEqual({
      42: new Folder(42, "test_folder", undefined, [1337, 7331], [1337, 21]),
      21: new Folder(21, "test_folder3", 1337, [], [12]),
      7331: new Folder(7331, "test_folder2", 42, [], [23]),
      1337: new Folder(1337, "test_folder1", 42, [21], [22]),
    });
  });

  it("should handle multiple roots", () => {
    let multipleRoots = [
      {
        id: 1337,
        clip_set: [22],
        path: "home/user/test_folder/",
        name: "test_folder1",
        parent: 42,
      },
      {
        id: 7331,
        clip_set: [23],
        path: "home/user/another_test_folder/",
        name: "test_folder2",
        parent: 21,
      },
      {
        id: 21,
        clip_set: [12],
        path: "home/user/",
        name: "another_test_folder",
        parent: null,
      },
      {
        id: 42,
        clip_set: [1337, 21],
        path: "home/user/",
        name: "test_folder",
        parent: null,
      },
    ];
    expect(parseFolders(multipleRoots)).toEqual({
      42: new Folder(42, "test_folder", undefined, [1337], [1337, 21]),
      1337: new Folder(1337, "test_folder1", 42, [], [22]),
      21: new Folder(21, "another_test_folder", undefined, [7331], [12]),
      7331: new Folder(7331, "test_folder2", 21, [], [23]),
    });
  });
});

describe("filter constants", () => {
  it("should have all filter constants correctly set", () => {
    expect(START_TIME).toEqual("start_time");
    expect(END_TIME).toEqual("end_time");
    expect(MIN_FRAME_RATE).toEqual("min_framerate");
    expect(WHITELISTED_RESOLUTIONS).toEqual("whitelisted_resolutions");
    expect(INCLUDED_CLIP_IDS).toEqual("included_clip_ids");
    expect(EXCLUDED_CLIP_IDS).toEqual("excluded_clip_ids");
    expect(OBJECTS).toEqual("classes");
  });
});
