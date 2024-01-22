import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Subtitle } from 'interfaces/subtitle';
// @ts-expect-error webvtt-parser doesn't have @types/webvtt-parser package
import { WebVTTParser } from 'webvtt-parser';

import Player from 'video.js/dist/types/player';

import { VideoFramesList } from 'Components/FramesList';
import { SubtitleList } from 'Components/SubtitleList';
import { VideoPlayer } from 'Components/VideoPlayer';

import { getCloudinaryFileUrl, getCloudinaryVideoUrl } from 'services/cloudinary';

export default function App() {
  const [videoUrl] = useState(getCloudinaryVideoUrl('test_video_editor/xqveap7pjub52c4dpyvy'));

  const playerRef = useRef<Player | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [startProgress, setStartProgress] = useState<number>(0);
  const [endProgress, setEndProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [subtitleList, setSubtitleList] = useState<Subtitle[]>([]);
  const [playBreakPoints, setPlayBreakPoints] = useState<{
    breakPointTime: number;
    nextTime: number;
  }[]>([]);

  const pauseVideoByEndProgress = useCallback(
    () => {
      if (playerRef.current && (playerRef.current.currentTime() || 0) >= endProgress / 100 * duration) {
        playerRef.current.pause();
      }
    },
    [playerRef, endProgress, duration]
  );
  const changeVideoCurrentTimeByPlayBreakPoints = useCallback(
    () => {
      if (playerRef.current) {
        const playerCurrentTime = playerRef.current.currentTime() || 0;
        const currentBreakPoints = playBreakPoints.find(({ breakPointTime, nextTime }) => (
          breakPointTime <= playerCurrentTime && nextTime >= playerCurrentTime
        ));

        if (currentBreakPoints) {
          playerRef.current.currentTime(currentBreakPoints.nextTime);
        }
      }
    },
    [playerRef, playBreakPoints]
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
    playerRef.current?.on('timeupdate', updateCurrentTime);
    playerRef.current?.on('play', updateIsPaused);
    playerRef.current?.on('pause', updateIsPaused);

    return () => {
      if (playerRef.current) {
        playerRef.current?.off('durationchange', updateDuration);
        playerRef.current?.off('timeupdate', updateCurrentTime);
        playerRef.current?.off('play', updateIsPaused);
        playerRef.current?.off('pause', updateIsPaused);
      }
    };
  }, [playerRef]);

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

  useEffect(() => {
    playerRef.current?.on('timeupdate', pauseVideoByEndProgress);
    playerRef.current?.on('timeupdate', changeVideoCurrentTimeByPlayBreakPoints);

    return () => {
      if (playerRef.current) {
        playerRef.current?.off('timeupdate', pauseVideoByEndProgress);
        playerRef.current?.off('timeupdate', changeVideoCurrentTimeByPlayBreakPoints);
      }
    };
  }, [playerRef, pauseVideoByEndProgress, changeVideoCurrentTimeByPlayBreakPoints]);

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
    <div className="grid grid-cols-4 max-w-screen-2xl mx-auto h-">
      <div className="col-span-3">
        <VideoPlayer
          ref={playerRef}
          height={400}
          src={videoUrl}
          type="video/mp4"
          onPlay={onPlay}
          isPaused={isPaused}
        />
        {
          !!subtitleList.length && (
            <VideoFramesList
              videoSrc={videoUrl}
              subtitleList={subtitleList}
              // progress={currentTime / duration * 100 || 0}
              onChangeCurrentTime={changeCurrentTime}
              startProgress={startProgress}
              endProgress={endProgress}
              onChangeProgressLength={changeProgressLength}
              frameClassName="h-24"
              onRemoveFrame={removeFrame}
              currentTime={currentTime}
              duration={duration}
            />
          )
        }
      </div>
      <div className="col-span-1">
        <SubtitleList
          subtitleList={subtitleList}
        />
      </div>
    </div>
  );

  function updateCurrentTime() {
    setCurrentTime(playerRef.current?.currentTime() || 0);
  }

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
    setPlayBreakPoints(currentValue => [...currentValue, {
      breakPointTime: startTime,
      nextTime: endTime,
    }]);
  }
}
