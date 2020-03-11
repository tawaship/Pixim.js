import { Content as _Content } from './Content';
import { TManifests, IContentManifestOption } from './ContentManifestBase';

class Content {
	static defineImages(data: TManifests, options: IContentManifestOption = {}) {
		return _Content;
	}
	
	addImages(data: TManifests, options: IContentManifestOption = {}) {
		return this;
	}
}