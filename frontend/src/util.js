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
