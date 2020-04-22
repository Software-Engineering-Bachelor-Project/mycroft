/* -- Tests for the types.js file -- */

import { Camera, Clip, Folder } from "../../types";

describe("Camera class", () => {
  it("should have all members set correctly", () => {
    var cam = new Camera(2, "Test Name", [4, 3], {}, true);
    expect(cam.id).toEqual(2);
    expect(cam.name).toEqual("Test Name");
    expect(cam.pos).toEqual([4, 3]);
    expect(cam.isEmpty()).toEqual(true);
    expect(cam.selected).toEqual(true);
  });

  it("should not be empty nor selected", () => {
    var cam = new Camera(2, "Test Name", [4, 3], { 1: undefined });
    expect(cam.isEmpty()).toEqual(false);
    expect(cam.selected).toEqual(false);
  });
});

describe("Clip class", () => {
  // Mock Folder
  var folder = new Folder();
  const mockGetPath = jest.spyOn(folder, "getPath");
  mockGetPath.mockReturnValue("fake/folder/");

  // Create clip
  var clip = new Clip(7, "test_name", folder, "wav", "69", "420");

  it("should have all members set correctly", () => {
    expect(clip.id).toEqual(7);
    expect(clip.name).toEqual("test_name");
    expect(clip.folder).toEqual(folder);
    expect(clip.format).toEqual("wav");
    expect(clip.startTime).toEqual("69");
    expect(clip.endTime).toEqual("420");
  });

  it("should produce correct full path", () => {
    expect(clip.getPath()).toEqual("fake/folder/test_name.wav");
  });

  // Restore mock folder
  afterAll(() => {
    mockGetPath.mockRestore();
  });
});

describe("Folder class", () => {
  // Create folders
  var f1 = new Folder(1, "root");
  var f2 = new Folder(
    2,
    "test1",
    f1,
    {},
    {
      1: "fake_clip",
    }
  );
  var f3 = new Folder(3, "test2", f1);
  f1.folders = {
    2: f2,
    3: f3,
  };
  var f4 = new Folder(4, "test3", f3);
  f3.folders = {
    4: f4,
  };

  it("should have all members set correctly", () => {
    // Folder 1
    expect(f1.id).toEqual(1);
    expect(f1.name).toEqual("root");
    expect(f1.parent).toEqual(undefined);
    expect(f1.clips).toEqual({});

    // Folder 2
    expect(f2.id).toEqual(2);
    expect(f2.name).toEqual("test1");
    expect(f2.parent).toEqual(f1);
    expect(f2.folders).toEqual({});
    expect(f2.clips).toEqual({ 1: "fake_clip" });
  });

  it("should produce correct full path", () => {
    expect(f1.getPath()).toEqual("root/");
    expect(f2.getPath()).toEqual("root/test1/");
    expect(f3.getPath()).toEqual("root/test2/");
    expect(f4.getPath()).toEqual("root/test2/test3/");
  });
});
