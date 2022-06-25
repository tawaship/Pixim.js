import * as PIXI from 'pixi.js';

export function resolveUri(basepath: string, uri: any, version?: string | number) {
	if (typeof(uri) !== 'string') {
		return uri;
	}
		
	if (!isUrl(uri)) {
		return uri;
	}
	
	basepath = basepath || '';
	version = version || '';
	const preUri = resolvePath(basepath, uri);
	
	return version ? resolveQuery(preUri, { _fv: version }) : preUri;
}


export function resolvePath(basepath: string, path: string) {
	if (!isUrl(path)) {
		return path;
	}
	
	return PIXI.utils.url.resolve(basepath, path);
}

export function isUrl(uri: any) {
	if (uri.indexOf('data:') === 0) {
		return false;
	}
	
	if (uri.indexOf('blob:') === 0) {
		return false;
	}
	
	return true;
}

export function resolveQuery(uri: string, queries: { [ name: string ]: any }): string {
	if (!isUrl(uri)) {
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