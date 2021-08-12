export default function loadJS(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.addEventListener('load', () => {
			resolve();
		});
		script.addEventListener('error', (e: any) => {
			reject(e);
		});
		document.body.appendChild(script);
		document.body.removeChild(script);
	});
}