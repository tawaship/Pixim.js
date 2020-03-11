import { TManifests, IContentManifestOption } from './ContentManifestBase';

class Content {
	static defineSpritesheets(data: TManifests, options: IContentManifestOption = {}): typeof Content {
		return this;
	}
	
	addSpritesheets(data: TManifests, options: IContentManifestOption = {}): this {
		return this;
	}
}