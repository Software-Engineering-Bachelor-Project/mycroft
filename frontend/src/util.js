/*
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

import { Folder, Clip } from "./types";
import store from "./state/state";
import {
  requestsInProgress,
  getFiles,
  getCameras,
  getFilter,
  getAreasInFilter,
  getClipsMatchingFilter,
  getFilterParams,
} from "./state/stateCommunication";
import { setTimeLimits, gbSetTimeLimits } from "./state/stateTimeline";

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
 * Set timeline bounds subject to current project clips.
 */
function setTimelineBounds() {
  // Find global start and end date
  let start, end;
  for (let c in store.getState().com.clips) {
    let clip = store.getState().com.clips[c];

    // Initial assignment
    if (start == undefined || end == undefined) {
      start = clip.startTime;
      end = clip.endTime;
      continue;
    }

    // Expand timeline bounds if applicable
    if (clip.startTime.getTime() < start.getTime()) start = clip.startTime;
    if (clip.endTime.getTime() > end.getTime()) end = clip.endTime;
  }

  // If start, end is undefined, don't set timeline bounds.
  if (!start || !end) return;

  // Get bounds for glassbox in timeline from filter
  let gbStartTime = store.getState().com.filter.startTime;
  let gbEndTime = store.getState().com.filter.endTime;

  // Set bounds for timeline
  store.dispatch(
    setTimeLimits(
      start,
      end,
      gbStartTime ? gbStartTime : start,
      gbEndTime ? gbEndTime : end
    )
  );
}

/**
 * Syncs a project by making requests.
 */
export function syncProject() {
  doActionsInOrder([
    () => {
      store.dispatch(getFilterParams());
      store.dispatch(getFiles());
      store.dispatch(getCameras());
      store.dispatch(getFilter());
      store.dispatch(getAreasInFilter());
      store.dispatch(getClipsMatchingFilter());
    },
    setTimelineBounds,
  ]);
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

export function parseClips(clipResponse) {
  let res = {};

  for (const c of clipResponse) {
    res[c.id] = new Clip(
      c.id,
      c.name,
      c.folder,
      c.camera,
      c.video_format,
      parseDatetimeString(c.start_time),
      parseDatetimeString(c.end_time),
      c.resolution,
      c.duplicates,
      c.overlap,
      c.frame_rate,
      c.playable
    );
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

/**
 * Finds all duplicates.
 * @param {Object[id: Clip]} clips Clips to look for duplicates of.
 * @return {Array[Array[Clips]]} List of duplicates.
 */
export function getDuplicates(clips) {
  let res = [];
  let processed = [];

  for (const clip of Object.values(clips)) {
    if (processed.includes(clip.id)) continue;

    let d = [];
    for (const id of clip.duplicates) {
      if (clips.hasOwnProperty(id)) {
        d.push(clips[id]);
        processed.push(id);
      }
    }

    if (d.length >= 1) {
      d.push(clip);
      res.push(d);
    }
  }

  return res;
}

/**
 * Finds all overlapping clips.
 * @param {Object[id: Clip]} clips Clips to look for overlapping clips of.
 * @return {Array[Array[Clips]]} List of overlapping.
 */
export function getOverlapping(clips) {
  let res = [];
  let vals = {};

  // Copy important info
  for (const clip of Object.values(clips))
    vals[clip.id] = clip.overlapping.filter((id) => clips.hasOwnProperty(id));

  for (let id in vals) {
    for (let overlap of vals[id]) {
      // Add overlapping pair
      res.push([clips[id], clips[overlap]]);
      // Remove from other overlapping list
      vals[overlap].splice(vals[overlap].indexOf(parseInt(id)), 1);
    }
  }

  return res;
}

/**
 * Gets duplicates of given clip.
 * @param {Clip} clip Clip to find duplicates to.
 * @param {Object[id: Clip]} clips Clips to look for duplicates of.
 * @return {Array[Clip]} Duplicates to given clip.
 */
export function getDuplicatesTo(clip, clips) {
  let res = [];
  for (const id of clip.duplicates) {
    if (clips.hasOwnProperty(id)) {
      res.push(clips[id]);
    }
  }
  return res;
}

/**
 * Gets overlapping clips to given clip.
 * @param {Clip} clip Clip to find overlapping clips to.
 * @param {Object[id: Clip]} clips Clips to look for overlapping clips of.
 * @return {Array[Clip]} Overlapping clips to given clip.
 */
export function getOverlappingTo(clip, clips) {
  let res = [];
  for (const id of clip.overlapping) {
    if (clips.hasOwnProperty(id)) {
      res.push(clips[id]);
    }
  }
  return res;
}
