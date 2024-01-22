import { CloudinaryFile, CloudinaryVideo } from '@cloudinary/url-gen';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { subtitles } from '@cloudinary/url-gen/qualifiers/source';

function getCloudConfig() {
  return {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  };
}

export function getCloudinaryVideoUrl(videoPublicID: string): string {
  return new CloudinaryVideo(videoPublicID)
    .setCloudConfig(getCloudConfig())
    .overlay(source(subtitles('test_video_editor/qcstwirl1ejcmc87qj1i.vtt')))
    .toURL();
}

export function getCloudinaryFileUrl(filePublicID: string): string {
  return new CloudinaryFile(filePublicID)
    .setCloudConfig(getCloudConfig())
    .setAssetType('raw')
    .toURL();
}
