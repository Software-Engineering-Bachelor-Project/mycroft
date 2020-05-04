/*
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

import { Folder } from "./types";
import { requestsInProgress } from "./state/stateCommunication";

/**
 *
 * This function is used to make POST-requests.
 * When the request is done, an action will be dispatched.
 * An extra parameter 'status' will be added onto the action.
 *
 * @param {string} url The sub-URL to send the request to. Will be appended onto the host URL.
 * @param {JSON} opts The JSON data to send through the request.
 * @param {fucntion} onResponse The function to be called upon request response. Expects two parameters: (status: int, data: JSON). If the request failed, 'data' will be undefined.
 *
 */
export function makePOST(url, opts = {}, onResponse) {
  fetch(url, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  }).then((r) => {
    // Status check
    if (r.ok) {
      console.log(
        "POST SUCCESS: '" + url + "' | " + r.status + " - " + r.statusText
      );
      // Call success function
      if (r.status == 200) r.json().then((data) => onResponse(r.status, data));
      else onResponse(r.status, undefined);
    } else {
      console.error(
        "POST FAILURE: '" + url + "' | " + r.status + " - " + r.statusText
      );
      onResponse(r.status, undefined);
    }
  });
}

/**
 * Takes an array of JSON folders and parses to folder objects.
 * @param {Array[Object]} folderResponse List of folders in JSON.
 * @return {Object[id, Folder]} An object with id as key and a Folder as value.
 */
export function parseFolders(folderResponse) {
  let res = {};

  // Construct folder objects.
  for (let f of folderResponse) {
    let newFolder = new Folder(
      f.id,
      f.name,
      f.parent ? f.parent : undefined,
      f.path,
      [],
      f.clip_set
    );
    res[f.id] = newFolder;
  }

  // Assign all subfolders to their parent.
  for (const sub of Object.values(res)) {
    if (sub.parent in res) res[sub.parent].children.push(sub.id);
  }

  return res;
}

/**
 * Converts a datetime string to a Date object
 * @param {string} dateStr A date in string format.
 * @return {Date} The string converted to a date.
 */
export function parseDatetimeString(dateStr) {
  return new Date(dateStr);
}

/**
 * Converts a Date object to a datetime string
 * @param {Date} date A Date object.
 * @return {string} The Date converted to a string.
 */
export function parseDateToString(date) {
  return date.toISOString();
}

export function getDistance(origin, destination) {
  // return distance in meters
  var lon1 = toRadian(origin[1]),
    lat1 = toRadian(origin[0]),
    lon2 = toRadian(destination[1]),
    lat2 = toRadian(destination[0]);

  var deltaLat = lat2 - lat1;
  var deltaLon = lon2 - lon1;

  var a =
    Math.pow(Math.sin(deltaLat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
  var c = 2 * Math.asin(Math.sqrt(a));
  var EARTH_RADIUS = 6371;
  return c * EARTH_RADIUS * 1000;
}
function toRadian(degree) {
  return (degree * Math.PI) / 180;
}
/**
 * Modify filter strings used in modifyFilter.
 */
export const START_TIME = "start_time";
export const END_TIME = "end_time";
export const MIN_FRAME_RATE = "min_framerate";
export const WHITELISTED_RESOLUTIONS = "whitelisted_resolutions";
export const INCLUDED_CLIP_IDS = "included_clip_ids";
export const EXCLUDED_CLIP_IDS = "excluded_clip_ids";
export const OBJECTS = "classes";

/**
 * Does busy waiting until all requests are processed then performs given actions in order.
 * @param {Array} actions List of actions to be performed.
 */
export function doActionsInOrder(actions) {
  let id = setInterval(() => {
    stopWaitingWhenFinished(id, actions);
  }, 100);
}

/**
 * Stops the waiting if all requests are processed and then executes next.
 * @param {Number} id interval id.
 * @param {Array} actions List of actions to be performed.
 */
function stopWaitingWhenFinished(id, actions) {
  if (requestsInProgress <= 0) {
    clearInterval(id);
    if (actions.length > 0) {
      actions[0]();
      actions.shift();
      doActionsInOrder(actions);
    }
  }
}
