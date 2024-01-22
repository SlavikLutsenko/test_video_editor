import { CloudinaryFile, CloudinaryVideo, Transformation } from '@cloudinary/url-gen';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { concatenate, trim } from '@cloudinary/url-gen/actions/videoEdit';
import { videoSource } from '@cloudinary/url-gen/qualifiers/concatenate';
import { subtitles } from '@cloudinary/url-gen/qualifiers/source';
import { PlayBreakPoint } from 'App';

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

export function cutCloudinaryVideo(
  videoPublicID: string,
  playBreakPoints: PlayBreakPoint[]
): string {
  const invertedPlayBreakPoints = invertPlayBreakPoints(playBreakPoints);

  let res = new CloudinaryVideo(videoPublicID)
    .setCloudConfig(getCloudConfig())
    .overlay(source(subtitles('test_video_editor/qcstwirl1ejcmc87qj1i.vtt')));

  if (invertedPlayBreakPoints.length) {
    res = res.videoEdit(
      trim()
        .startOffset(invertedPlayBreakPoints[0].breakPointTime)
        .endOffset(invertedPlayBreakPoints[0].nextTime)
    );

    for (let i = 1; i < invertedPlayBreakPoints.length; i++) {
      res = res.videoEdit(
        concatenate(
          videoSource(videoPublicID).transformation(
            new Transformation()
              .videoEdit(
                trim()
                  .startOffset(invertedPlayBreakPoints[i].breakPointTime)
                  .endOffset(invertedPlayBreakPoints[i].nextTime)
              )
          )
        )
      );
    }
  }

  return res.toURL();
}

function invertPlayBreakPoints(playBreakPoints: PlayBreakPoint[]) {
  const res: PlayBreakPoint[] = [];

  for (let i = 0; i < playBreakPoints.length - 1; i++) {
    res.push({
      breakPointTime: playBreakPoints[i].nextTime,
      nextTime: playBreakPoints[i + 1]?.breakPointTime,
    });
  }

  return res;
}
