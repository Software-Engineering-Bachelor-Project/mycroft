/*
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

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
