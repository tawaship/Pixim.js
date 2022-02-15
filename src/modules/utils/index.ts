import * as PIXI from 'pixi.js';

export function resolvePath(path: string, basepath: string) {
	if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
		return path;
	} else {
		return PIXI.utils.url.resolve(basepath.replace(/([^\/])$/, '$1/'), path);
	}
}

export function resolveQuery(uri: string, queries: { [ name: string ]: any }): string {
	if (uri.indexOf('data:') === 0) {
		return uri;
	} else {
		const q = [];
		
		const t = uri.split('?');
		
		if (t[1]) {
			const search = t[1].split('&');
			for (let i = 0; i < search.length; i++) {
				const p = search[i].split('=');
				if (!(p[0] in queries)) {
					q.push(search[i]);
				}
			}
		}
		
		for (let i in queries) {
			q.push(`${i}=${queries[i]}`);
		}
		
		return `${t[0]}?${q.join('&')}`;
	}
}