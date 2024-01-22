import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { Subtitle } from 'interfaces/subtitle';
// @ts-expect-error webvtt-parser doesn't have @types/webvtt-parser package
import { WebVTTParser } from 'webvtt-parser';

import Player from 'video.js/dist/types/player';

import { VideoFramesList } from 'Components/FramesList';
import { SubtitleList } from 'Components/SubtitleList';
import { VideoPlayer } from 'Components/VideoPlayer';

import { cutCloudinaryVideo, getCloudinaryFileUrl, getCloudinaryVideoUrl } from 'services/cloudinary';

export interface PlayBreakPoint {
  breakPointTime: number;
  nextTime: number;
}

export default function App() {
  const playerRef = useRef<Player | null>(null);
  const playerVideoFrameCallbackID = useRef<number>(0);

  const [videoUrl] = useState(getCloudinaryVideoUrl('test_video_editor/xqveap7pjub52c4dpyvy'));
  const [duration, setDuration] = useState<number>(0);
  const [startProgress, setStartProgress] = useState<number>(0);
  const [endProgress, setEndProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [subtitleList, setSubtitleList] = useState<Subtitle[]>([]);
  const [playBreakPoints, setPlayBreakPoints] = useState<PlayBreakPoint[]>([]);

  const downloadLink = useMemo(
    () => {
      const startTime = startProgress / 100 * duration;
      const endTime = endProgress / 100 * duration;

      return cutCloudinaryVideo(
        'test_video_editor/xqveap7pjub52c4dpyvy',
        optimizePlayBreakPoints([
          ...playBreakPoints,
          {
            breakPointTime: 0,
            nextTime: startTime,
          },
          {
            breakPointTime: endTime,
            nextTime: duration,
          },
        ])
      );
    },
    [playBreakPoints, startProgress, endProgress, duration]
  );

  const changeVideoEditorStates = useCallback(
    () => {
      const player = playerRef.current;
      const videoEl = player?.tech(true);
      const videoDuration = player?.duration() || 0;
      const videoCurrentTime = player?.currentTime() || 0;
      const endTime = endProgress / 100 * videoDuration;

      if (videoEl && player) {
        if ((videoCurrentTime || 0) >= endTime) {
          player.pause();
        }

        const currentBreakPoints = playBreakPoints.find(({ breakPointTime, nextTime }) => (
          breakPointTime <= videoCurrentTime && nextTime >= videoCurrentTime
        ));

        if (currentBreakPoints) {
          player.currentTime(currentBreakPoints.nextTime);
        }

        playerVideoFrameCallbackID.current = videoEl.requestVideoFrameCallback(changeVideoEditorStates);
      }
    },
    [playerRef, startProgress, endProgress, playBreakPoints]
  );
  const onPlay = useCallback(
    () => {
      if (playerRef.current) {
        if ((playerRef.current.currentTime() || 0) >= endProgress / 100 * duration) {
          playerRef.current.currentTime(startProgress / 100 * duration);
        }

        playerRef.current.play();
      }
    },
    [playerRef, startProgress, endProgress, duration]
  );

  useEffect(() => {
    updateIsPaused();
    playerRef.current?.on('durationchange', updateDuration);
    playerRef.current?.on('play', updateIsPaused);
    playerRef.current?.on('pause', updateIsPaused);
    playerVideoFrameCallbackID.current = playerRef.current?.tech(true)?.requestVideoFrameCallback(
      changeVideoEditorStates
    ) || 0;

    return () => {
      if (playerRef.current) {
        playerRef.current?.off('durationchange', updateDuration);
        playerRef.current?.off('play', updateIsPaused);
        playerRef.current?.off('pause', updateIsPaused);
        playerRef.current?.tech(true)?.cancelVideoFrameCallback(playerVideoFrameCallbackID.current);
      }
    };
  }, [playerRef, playerRef.current?.tech(), changeVideoEditorStates]);

  useEffect(() => {
    const startTime = startProgress / 100 * duration;
    const endTime = endProgress / 100 * duration;

    if (playerRef.current && startTime > (playerRef.current.currentTime() || 0)) {
      playerRef.current.currentTime(startTime);
    }
    if (playerRef.current && endTime < (playerRef.current.currentTime() || 0)) {
      playerRef.current.currentTime(endTime);
    }
  }, [playerRef, startProgress, endProgress, duration]);

  useEffect(
    () => {
      const controller = new AbortController();

      (async () => {
        const { data } = await axios(
          getCloudinaryFileUrl('test_video_editor/qcstwirl1ejcmc87qj1i.vtt'),
          {
            signal: controller.signal,
          }
        );

        setSubtitleList((new WebVTTParser()).parse(data).cues);
      })();

      return () => {
        controller.abort();
      };
    },
    []
  );

  return (
    <div className="grid grid-cols-4 max-w-screen-2xl mx-auto gap-3 py-3">
      <div className="col-span-3 space-y-3">
        <VideoPlayer
          ref={playerRef}
          height={400}
          src={videoUrl}
          type="video/mp4"
          onPlay={onPlay}
          isPaused={isPaused}
        />
        {
          !!subtitleList.length && playerRef.current && (
            <VideoFramesList
              videoSrc={videoUrl}
              subtitleList={subtitleList}
              frameClassName="h-24"
              videoPlayer={playerRef.current}
              duration={duration}
              onChangeCurrentTime={changeCurrentTime}
              startProgress={startProgress}
              endProgress={endProgress}
              onChangeProgressLength={changeProgressLength}
              onRemoveFrame={removeFrame}
            />
          )
        }
      </div>
      <div className="col-span-1 space-y-3">
        <a
          className="
            flex items-center justify-center gap-3 w-full border-2 rounded-lg p-3 border-blue-500 text-blue-500
            hover:bg-blue-500 hover:text-white transition-all
          "
          href={downloadLink}
          download
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faDownload} />
          Download
        </a>
        <SubtitleList
          subtitleList={subtitleList}
          onRemoveFrame={removeFrame}
        />
      </div>
    </div>
  );

  function updateDuration() {
    setDuration(playerRef.current?.duration() || 0);
  }

  function updateIsPaused() {
    setIsPaused(!!playerRef.current?.paused());
  }

  function changeCurrentTime(newProgress: number) {
    playerRef.current?.currentTime(newProgress * duration);
  }

  function changeProgressLength([newStartProgress, newEndProgress]: number[]) {
    setStartProgress(newStartProgress);
    setEndProgress(newEndProgress);
  }

  function removeFrame(startTime: number, endTime: number) {
    setSubtitleList(currentValue => currentValue.map(subtitle => ({
      ...subtitle,
      isRemoved: subtitle.isRemoved ? subtitle.isRemoved : subtitle.startTime === startTime,
    })));
    setPlayBreakPoints(currentValue => optimizePlayBreakPoints([
      ...currentValue,
      {
        breakPointTime: startTime - 0.1,
        nextTime: endTime,
      },
    ]));
  }

  function optimizePlayBreakPoints(breakPoints: PlayBreakPoint[]) {
    return breakPoints
      .sort(({ breakPointTime: a }, { breakPointTime: b }) => a - b)
      .reduce(
        (accumulator, currentItem) => {
          const nearbyRightIdx = accumulator.findIndex(({ nextTime }) => currentItem.breakPointTime <= nextTime);
          const nearbyLeftIdx = accumulator.findIndex(({ breakPointTime }) => currentItem.nextTime <= breakPointTime);

          if (nearbyRightIdx !== -1) {
            accumulator[nearbyRightIdx].nextTime = currentItem.nextTime;
          }
          else if (nearbyLeftIdx !== -1) {
            accumulator[nearbyLeftIdx].breakPointTime = currentItem.breakPointTime;
          }
          else {
            accumulator.push(currentItem);
          }

          return accumulator;
        },
        [] as PlayBreakPoint[]
      );
  }
}
