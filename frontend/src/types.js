/* -- This files contains non-React classes -- */

/**
 * This class represents a Project.
 */
export class Project {
  /**
   * @param {int} id The unique identifier of this project. Corresponds to the backend database.
   * @param {string} name The name of this project.
   * @param {Date} created A Date object representing when this project was created.
   * @param {Date} lastUpdated A Date object representing when this project was last updated.
   * @param {dict[int: Folder]} folders The source folders of this project, mapped in a dictionary by their own IDs.
   * @param {int} filter The filter's id.
   */
  constructor(id, name, created, lastUpdated, folders, filter) {
    this.id = id;
    this.name = name;
    this.created = created;
    this.lastUpdated = lastUpdated;
    this.folders = folders;
    this.filter = filter;
  }

  /**
   *
   * Returns whether or not this camera contains any clips.
   *
   * @return {boolean} True if this camera does not contain any clips.
   */
  isEmpty() {
    return Object.keys(this.clips).length == 0;
  }
}

/**
 * This class represents a Camera.
 */
export class Camera {
  /**
   * @param {int} id The unique identifier of this camera. Corresponds to the backend database.
   * @param {string} name The name of this camera.
   * @param {Object} pos The decimal latitude and longitude of this camera. The object has two attributes, latitude and longitude.
   * @param {Array[int]} clips A list containing this camera's clip's ID:s.
   * @param {boolean} selected Whether this camera is selected or not.
   */
  constructor(id, name, pos, clips = [], selected = false) {
    this.id = id;
    this.name = name;
    this.pos = pos;
    this.clips = clips;
    this.selected = selected;
  }

  /**
   *
   * Returns whether or not this camera contains any clips.
   *
   * @return {boolean} True if this camera does not contain any clips.
   */
  isEmpty() {
    return this.clips.length == 0;
  }
}

/**
 * This class represents a Clip.
 */
export class Clip {
  /**
   * @param {int} id The unique identifier of this clip. Corresponds to the backend database.
   * @param {string} name The file name of this clip, without file extension.
   * @param {Number} folder The id of the folder containing this clip.
   * @param {Number} camera The id of the camera containing this clip.
   * @param {string} format The file format of this clip, 'wav' etc.
   * @param {Date} startTime The point in time when the clip starts.
   * @param {Date} endTime The point in time when the clip ends.
   * @param {Array[int]} duplicates List of id's of duplicated clips.
   * @param {Array[int]} overlapping List of id's of overlapping clips.
   */
  constructor(
    id,
    name,
    folder,
    camera,
    format,
    startTime,
    endTime,
    resolution,
    duplicates = [],
    overlapping = []
  ) {
    this.id = id;
    this.name = name;
    this.folder = folder;
    this.camera = camera;
    this.format = format;
    this.startTime = startTime;
    this.endTime = endTime;
    this.resolution = resolution;
    this.duplicates = duplicates;
    this.overlapping = overlapping;
  }

  /**
   *
   * Calculates the complete file path, including containing folder and file extension.
   * @param {Object[int, Folder]} Current folders in store.
   * @return {string} The full file path of this clip.
   */
  getPath(folders) {
    return (
      folders[this.folder].getPath(folders) + this.name + "." + this.format
    );
  }
}

/**
 * This class represents a Folder.
 */
export class Folder {
  /**
   * @param {int} id The unique identifier of this folder. Corresponds to the backend database.
   * @param {string} name The name of this folder.
   * @param {int} parent The id of the folder containing this folder. Should be undefined if root.
   * @param {Array[int]} children ID:s to children folders.
   * @param {Array[int]} clips ID:s to clips in the folder.
   */
  constructor(id, name, parent = undefined, children = [], clips = []) {
    this.id = id;
    this.name = name;
    this.parent = parent;
    this.children = children;
    this.clips = clips;
  }

  /**
   *
   * Calculates the full path of this folder recursively.
   * @param {Object[int, Folder]} Current folders in store.
   * @return {string} the full path of this folder.
   */
  getPath(folders) {
    if (this.parent != undefined && this.parent in folders)
      return folders[this.parent].getPath(folders) + this.name + "/";
    else return this.name + "/";
  }
}

/**
 * This class represents an Area.
 */
export class Area {
  /**
   * @param {string} latitude Latidue for Area.
   * @param {string} longitude Longitude for Area.
   * @param {number} radius Radius of Area in meters.
   */
  constructor(latitude, longitude, radius) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
  }
}

/**
 * This class represents a Resolution.
 */
export class Resolution {
  /**
   *
   * @param {Number} width width in pixels.
   * @param {*} height height in pixels.
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}
