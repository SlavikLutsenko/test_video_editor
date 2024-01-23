import { CloudinaryFile, CloudinaryVideo, Transformation } from '@cloudinary/url-gen';
import { opacity } from '@cloudinary/url-gen/actions/adjust';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { fill, scale } from '@cloudinary/url-gen/actions/resize';
import { concatenate, trim } from '@cloudinary/url-gen/actions/videoEdit';
import { Position } from '@cloudinary/url-gen/qualifiers';
import { videoSource } from '@cloudinary/url-gen/qualifiers/concatenate';
import { compass } from '@cloudinary/url-gen/qualifiers/gravity';
import { image, subtitles } from '@cloudinary/url-gen/qualifiers/source';
import { LogoPosition, PlayBreakPoint } from 'App';

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
  playBreakPoints: PlayBreakPoint[],
  addLogo: LogoPosition = LogoPosition.none,
  addIntro = false
): string {
  const invertedPlayBreakPoints = invertPlayBreakPoints(playBreakPoints);

  let res = addIntro
    ? new CloudinaryVideo('samples/sea-turtle')
      .setCloudConfig(getCloudConfig())
      .overlay(source(subtitles('test_video_editor/qcstwirl1ejcmc87qj1i.vtt')))
      .videoEdit(
        trim()
          .startOffset(0)
          .endOffset(5)
      )
      .resize(
        fill()
          .width(640)
          .height(334)
      )
    : new CloudinaryVideo(videoPublicID)
      .setCloudConfig(getCloudConfig());

  if (invertedPlayBreakPoints.length) {
    res = res.videoEdit(
      addIntro
        ? concatenate(
          videoSource(videoPublicID).transformation(
            new Transformation()
              .videoEdit(
                trim()
                  .startOffset(invertedPlayBreakPoints[0].breakPointTime)
                  .endOffset(invertedPlayBreakPoints[0].nextTime)
              )
          )
        )
        : trim()
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

  if (addLogo !== LogoPosition.none) {
    res = res.overlay(
      source(
        image('test_video_editor/m4i0brvxzxokkbj1jjem')
          .transformation(
            new Transformation()
              .resize(scale().width(100))
              .adjust(opacity(70))
          )
      )
        .position(new Position().gravity(compass(addLogo as unknown as string)))
    );
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
