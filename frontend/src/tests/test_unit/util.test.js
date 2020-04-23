/* -- THIS FILE TESTS THE UTIL FILE .. */

import { Folder } from "../../types";
import { createFolderHierachy, createFolderHierarchy } from "../../util";

describe("CreateFolderHierachy", () => {
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
    expect(createFolderHierarchy(single)).toEqual({
      42: new Folder(42, "test_folder", undefined, {}, [1337, 21]),
    });
  });

  it("should handle empty lists", () => {
    expect(createFolderHierarchy([])).toEqual({});
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
    expect(createFolderHierarchy(multipleLevels)).toEqual({
      42: new Folder(
        42,
        "test_folder",
        undefined,
        {
          1337: new Folder(
            1337,
            "test_folder1",
            42,
            { 21: new Folder(21, "test_folder3", 1337, {}, [12]) },
            [22]
          ),
          7331: new Folder(7331, "test_folder2", 42, {}, [23]),
        },
        [1337, 21]
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
    expect(createFolderHierarchy(multipleRoots)).toEqual({
      42: new Folder(
        42,
        "test_folder",
        undefined,
        { 1337: new Folder(1337, "test_folder1", 42, {}, [22]) },
        [1337, 21]
      ),
      21: new Folder(
        21,
        "another_test_folder",
        undefined,
        { 7331: new Folder(7331, "test_folder2", 21, {}, [23]) },
        [12]
      ),
    });
  });
});
