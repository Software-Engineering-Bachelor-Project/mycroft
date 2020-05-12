/* -- Tests for the types.js file -- */

import { Camera, Clip, Folder, Resolution, Area } from "../../types";

describe("Camera class", () => {
  it("should have all members set correctly", () => {
    var cam = new Camera(
      2,
      "Test Name",
      { latitude: "0.1337", longitude: "42.0" },
      [],
      true
    );
    expect(cam.id).toEqual(2);
    expect(cam.name).toEqual("Test Name");
    expect(cam.pos).toEqual({ latitude: "0.1337", longitude: "42.0" });
    expect(cam.countCommonClips([1])).toEqual(0);
    expect(cam.selected).toEqual(true);
  });

  it("should not be empty nor selected", () => {
    var cam = new Camera(
      2,
      "Test Name",
      { latitude: "0.1337", longitude: "42.0" },
      [1]
    );
    expect(cam.countCommonClips([1])).toEqual(1);
    expect(cam.selected).toEqual(false);
  });
});

describe("Clip class", () => {
  let f = new Folder(1, "root");
  let allFolders = { 1: f };
  const resolution = new Resolution(1920, 1080);
  const st = new Date(2020, 1, 1, 3, 24, 0);
  const et = new Date(2020, 1, 1, 4, 24, 0);

  // Create clip
  var clip = new Clip(
    7,
    "test_name",
    1,
    1,
    "wav",
    st,
    et,
    resolution,
    [1337],
    [1338],
    42,
    true,
    { rate: 1337, objects: { monkey: 33 } }
  );

  it("should have all members set correctly", () => {
    expect(clip.id).toEqual(7);
    expect(clip.name).toEqual("test_name");
    expect(clip.folder).toEqual(1);
    expect(clip.camera).toEqual(1);
    expect(clip.format).toEqual("wav");
    expect(clip.startTime).toEqual(st);
    expect(clip.endTime).toEqual(et);
    expect(clip.resolution).toEqual(resolution);
    expect(clip.duplicates).toEqual([1337]);
    expect(clip.overlapping).toEqual([1338]);
    expect(clip.frameRate).toEqual(42);
    expect(clip.playable).toEqual(true);
    expect(clip.objectDetection).toEqual({
      rate: 1337,
      objects: { monkey: 33 },
    });
  });

  it("should produce correct full path", () => {
    expect(clip.getPath(allFolders)).toEqual("root/test_name.wav");
  });
});

describe("Folder class", () => {
  // Create folders
  var f1 = new Folder(1, "root");
  var f2 = new Folder(2, "test1", 1, "test_path", [], [1]);
  var f3 = new Folder(3, "test2", 1);
  f1.children = [2, 3];
  var f4 = new Folder(4, "test3", 3);
  f3.children = [4];
  let allFolders = { 1: f1, 2: f2, 3: f3, 4: f4 };

  it("should have all members set correctly", () => {
    // Folder 1
    expect(f1.id).toEqual(1);
    expect(f1.name).toEqual("root");
    expect(f1.parent).toEqual(undefined);
    expect(f1.absolutePath).toEqual(undefined);
    expect(f1.clips).toEqual([]);

    // Folder 2
    expect(f2.id).toEqual(2);
    expect(f2.name).toEqual("test1");
    expect(f2.parent).toEqual(1);
    expect(f2.absolutePath).toEqual("test_path");
    expect(f2.children).toEqual([]);
    expect(f2.clips).toEqual([1]);
  });

  it("should produce correct full path", () => {
    expect(f1.getPath(allFolders)).toEqual("root/");
    expect(f2.getPath(allFolders)).toEqual("root/test1/");
    expect(f3.getPath(allFolders)).toEqual("root/test2/");
    expect(f4.getPath(allFolders)).toEqual("root/test2/test3/");
  });

  it("should know whether it is a source", () => {
    // Source
    expect(f1.isSource(allFolders)).toEqual(true);

    // Not source
    expect(f2.isSource(allFolders)).toEqual(false);
  });
});

describe("Resolution class", () => {
  // Create resolution
  var r = new Resolution(1920, 1080);

  it("should have all members set correctly", () => {
    expect(r.width).toEqual(1920);
    expect(r.height).toEqual(1080);
  });
});

describe("Area class", () => {
  // Create area
  var a = new Area("0.1337", "1.4200", 1337);

  it("should have all members set correctly", () => {
    expect(a.latitude).toEqual("0.1337");
    expect(a.longitude).toEqual("1.4200");
    expect(a.radius).toEqual(1337);
  });
});
