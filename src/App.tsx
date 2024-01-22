import { useCallback, useEffect, useRef, useState } from 'react';

import Player from 'video.js/dist/types/player';

import { VideoFramesList } from 'Components/FramesList';
import { VideoPlayer } from 'Components/VideoPlayer';

import { getCloudinaryVideoUrl } from 'services/cloudinary';

export default function App() {
  const [videoUrl] = useState(getCloudinaryVideoUrl('test_video_editor/xqveap7pjub52c4dpyvy'));

  const playerRef = useRef<Player | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [startProgress, setStartProgress] = useState<number>(0);
  const [endProgress, setEndProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  const pauseVideoByEndProgress = useCallback(
    () => {
      if (playerRef.current && (playerRef.current.currentTime() || 0) >= endProgress / 100 * duration) {
        playerRef.current.pause();
      }
    },
    [playerRef, endProgress, duration]
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

    return () => {
      if (playerRef.current) {
        playerRef.current?.off('timeupdate', pauseVideoByEndProgress);
      }
    };
  }, [playerRef, endProgress, duration]);

  return (
    <div className="grid grid-cols-4 max-w-screen-2xl mx-auto">
      <div className="col-span-3">
        <VideoPlayer
          ref={playerRef}
          height={400}
          src={videoUrl}
          type="video/mp4"
          onPlay={onPlay}
          isPaused={isPaused}
        />
        <VideoFramesList
          videoSrc={videoUrl}
          intervals={[5, 10, 20, 30, 50, 54]}
          progress={currentTime / duration * 100 || 0}
          onChangeCurrentTime={changeCurrentTime}
          startProgress={startProgress}
          endProgress={endProgress}
          onChangeProgressLength={changeProgressLength}
        />
      </div>
      <div className="col-span-1">
        subtitles
        {' '}
        {currentTime}
        {' '}
        {duration}
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
}
