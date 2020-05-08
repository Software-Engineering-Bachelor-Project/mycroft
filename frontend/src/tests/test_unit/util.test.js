/* -- THIS FILE TESTS THE UTIL FILE .. */

import { Folder, Clip } from "../../types";
import {
  parseFolders,
  START_TIME,
  END_TIME,
  MIN_FRAME_RATE,
  WHITELISTED_RESOLUTIONS,
  INCLUDED_CLIP_IDS,
  EXCLUDED_CLIP_IDS,
  OBJECTS,
  getDuplicates,
  getOverlapping,
  getDuplicatesTo,
  getOverlappingTo,
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
      42: new Folder(
        42,
        "test_folder",
        undefined,
        "home/user/",
        [],
        [1337, 21]
      ),
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
      42: new Folder(
        42,
        "test_folder",
        undefined,
        "home/user/",
        [1337, 7331],
        [1337, 21]
      ),
      21: new Folder(
        21,
        "test_folder3",
        1337,
        "home/user/test_folder/test_folder1/",
        [],
        [12]
      ),
      7331: new Folder(
        7331,
        "test_folder2",
        42,
        "home/user/test_folder/",
        [],
        [23]
      ),
      1337: new Folder(
        1337,
        "test_folder1",
        42,
        "home/user/test_folder/",
        [21],
        [22]
      ),
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
      42: new Folder(
        42,
        "test_folder",
        undefined,
        "home/user/",
        [1337],
        [1337, 21]
      ),
      1337: new Folder(
        1337,
        "test_folder1",
        42,
        "home/user/test_folder/",
        [],
        [22]
      ),
      21: new Folder(
        21,
        "another_test_folder",
        undefined,
        "home/user/",
        [7331],
        [12]
      ),
      7331: new Folder(
        7331,
        "test_folder2",
        21,
        "home/user/another_test_folder/",
        [],
        [23]
      ),
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

describe("duplicates", () => {
  const c1 = new Clip(
    1,
    "c1",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [2, 3],
    [],
    undefined,
    undefined
  );
  const c2 = new Clip(
    2,
    "c2",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [1, 3],
    [],
    undefined,
    undefined
  );
  const c3 = new Clip(
    3,
    "c3",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [1, 2],
    [],
    undefined,
    undefined
  );
  const c4 = new Clip(
    4,
    "c4",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [5],
    [],
    undefined,
    undefined
  );
  const c5 = new Clip(
    5,
    "c5",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [4],
    [],
    undefined,
    undefined
  );

  it("should find all duplicates", () => {
    expect(getDuplicates({ 1: c1, 2: c2 })).toEqual([[c2, c1]]);
    expect(getDuplicates({ 1: c1, 2: c2, 3: c3 })).toEqual([[c2, c3, c1]]);
    expect(getDuplicates({ 4: c4, 5: c5, 3: c3 })).toEqual([[c5, c4]]);
    expect(getDuplicates({ 1: c1, 2: c2, 3: c3, 4: c4, 5: c5 })).toEqual([
      [c2, c3, c1],
      [c5, c4],
    ]);
  });

  it("should find all duplicates to a clip", () => {
    expect(getDuplicatesTo(c1, { 1: c1, 2: c2, 4: c4 })).toEqual([c2]);
    expect(getDuplicatesTo(c1, { 1: c1, 2: c2, 3: c3, 4: c4 })).toEqual([
      c2,
      c3,
    ]);
    expect(getDuplicatesTo(c1, { 1: c1, 3: c3, 4: c4 })).toEqual([c3]);
  });
});

describe("getOverlapping", () => {
  const c1 = new Clip(
    1,
    "c1",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [2],
    undefined,
    undefined
  );
  const c2 = new Clip(
    2,
    "c2",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [1, 3],
    undefined,
    undefined
  );
  const c3 = new Clip(
    3,
    "c3",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [2],
    undefined,
    undefined
  );
  const c4 = new Clip(
    4,
    "c4",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [5, 6],
    undefined,
    undefined
  );
  const c5 = new Clip(
    5,
    "c5",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [4, 6],
    undefined,
    undefined
  );
  const c6 = new Clip(
    6,
    "c6",
    1,
    undefined,
    "x",
    undefined,
    undefined,
    undefined,
    [],
    [4, 5],
    undefined,
    undefined
  );

  it("should find overlapping", () => {
    expect(getOverlapping({ 1: c1, 2: c2 })).toEqual([[c1, c2]]);
    expect(getOverlapping({ 1: c1, 2: c2, 3: c3 })).toEqual([
      [c1, c2],
      [c2, c3],
    ]);
    expect(getOverlapping({ 4: c4, 5: c5, 3: c3 })).toEqual([[c4, c5]]);
    expect(getOverlapping({ 4: c4, 5: c5, 6: c6 })).toEqual([
      [c4, c5],
      [c4, c6],
      [c5, c6],
    ]);
    expect(getOverlapping({ 1: c1, 2: c2, 3: c3, 4: c4, 5: c5 })).toEqual([
      [c1, c2],
      [c2, c3],
      [c4, c5],
    ]);
  });

  it("should find all overlapping clips to a given clip", () => {
    expect(getOverlappingTo(c1, { 1: c1, 2: c2 })).toEqual([c2]);
    expect(getOverlappingTo(c1, { 1: c1, 2: c2, 3: c3 })).toEqual([c2]);
    expect(
      getOverlappingTo(c4, { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6 })
    ).toEqual([c5, c6]);
  });
});
