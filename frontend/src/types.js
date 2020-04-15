/* -- This files contains non-React classes -- */

/**
 * This class represents a Camera.
 */
export class Camera {
    /**
     * @param {int} id The unique identifier of this camera. Corresponds to the backend database.
     * @param {string} name The name of this camera.
     * @param {[number, number]} pos The decimal longitude and latitude of this camera.
     * @param {dict[int: Clip]} clips A dictionary containing this camera's clips, mapped by their own IDs.
     * @param {boolean} selected Whether this camera is selected or not.
     */
    constructor(id, name, pos, clips = {}, selected = false) {
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
        return Object.keys(this.clips).length == 0;
    }
}

/**
 * This class represents a Clip.
 */
export class Clip {
    /**
     * @param {int} id The unique identifier of this clip. Corresponds to the backend database.
     * @param {string} name The file name of this clip, without file extension.
     * @param {Folder} folder The path of the folder containing this clip.
     * @param {string} format The file format of this clip, 'wav' etc.
     * @param {??????} startTime The point in time when the clip starts.
     * @param {??????} endTime The point in time when the clip ends.
     */
    constructor(id, name, folder, format, startTime, endTime) {
        this.id = id;
        this.name = name;
        this.folder = folder;
        this.format = format;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    /**
     * 
     * Calculates the complete file path, including containing folder and file extension.
     * 
     * @return {string} The full file path of this clip.
     */
    getPath() {
        return this.folder.getPath() + this.name + '.' + this.format;
    }
}


/**
 * This class represents a Folder.
 */
export class Folder {
    /**
     * @param {int} id The unique identifier of this folder. Corresponds to the backend database.
     * @param {string} name The name of this folder.
     * @param {Folder} parent The folder containing this folder. Should be undefined if root.
     * @param {dict[int: Folder]} folders A dictionary containing subfolders, mapped by their own IDs.
     * @param {dict[int: Clip]} clips A dictionary containing this folder's clips, mapped by their own IDs.
     */
    constructor(id, name, parent=undefined, folders = {}, clips = {}) {
        this.id = id;
        this.name = name;
        this.parent = parent;
        this.folders = folders;
        this.clips = clips;
    }

    /**
     * 
     * Calculates the full path of this folder recursively.
     * 
     * @return {string} the full path of this folder.
     */
    getPath() {
        if (this.parent == undefined)
            return this.name + '/';
        else
            return this.parent.getPath() + this.name + '/';
    }
}