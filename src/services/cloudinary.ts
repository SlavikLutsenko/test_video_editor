import { subtitles } from '@cloudinary/transformation-builder-sdk/qualifiers/source';
import { CloudinaryVideo } from '@cloudinary/url-gen';
import { source } from '@cloudinary/url-gen/actions/overlay';

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
