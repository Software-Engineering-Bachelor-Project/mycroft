
/* 
 * This file contains helper-functions to be
 * used throughout Mycroft.
 */

// This function is used to make post-requests.
// Follow up a call to this function by using
// .then(data => {}) where 'data' is the
// received JSON-formatted data.
export function makePOST(url, opts) {
    return fetch(url, {
	method: 'post',
	headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	},
	body: JSON.stringify(opts)
    }).then(r => {return r.json()});
}
