/*
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

import { Folder } from "./types";

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
  return date.toISOString()
}
