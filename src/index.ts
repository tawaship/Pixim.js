export * from './modules/Application';
export * from './modules/Container';
export * from './modules/Content';
export * from './modules/Emitter';
export * from './modules/ContentManifestBase';

import { Content } from './modules/Content';

import { ContentImageManifest } from './modules/ContentImageManifest';
Content.useManifestClass(ContentImageManifest);

import { ContentSpritesheetManifest } from './modules/ContentSpritesheetManifest';
Content.useManifestClass(ContentSpritesheetManifest);
