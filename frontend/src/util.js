/* 
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

/**
 * 
 * This function is used to make POST-requests.
 * 
 * @param {string} url The sub-URL to send the request to. Will be appended onto the host URL.
 * @param {JSON} opts The JSON data to send through the request.
 * @param {fucntion} onResponse The function to be called upon request response. Expects two parameters: (status: int, data: JSON). If the request fails, 'data' will be undefined.
 * 
 */
export function makePOST(url, opts={}, onResponse) {
    fetch(url, {
                method: 'post',
                headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                },
                body: JSON.stringify(opts)
    }).then(r => {

        // Status check
        if (r.ok) {
            console.log('POST SUCCESS: \'' + url + '\' | ' + r.status
                        + ' - ' + r.statusText);
            // Call success function
            r.json().then(data => onResponse(r.status, data));
        } else {
            console.error('POST FAILURE: \'' + url + '\' | ' + r.status
                          + ' - ' + r.statusText);
            onResponse(r.status, undefined);
        }
    });
}
