import { useEffect, useRef, useState } from 'react';

import Player from 'video.js/dist/types/player';

import { VideoFramesList } from 'Components/FramesList';
import { VideoPlayer } from 'Components/VideoPlayer';

import { getCloudinaryVideoUrl } from 'services/cloudinary';

export default function App() {
  const [videoUrl] = useState(getCloudinaryVideoUrl('test_video_editor/xqveap7pjub52c4dpyvy'));

  const playerRef = useRef<Player | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    playerRef.current?.on('durationchange', updateDuration);
    playerRef.current?.on('timeupdate', updateCurrentTime);

    return () => {
      if (playerRef.current) {
        playerRef.current?.off('durationchange', updateDuration);
        playerRef.current?.off('timeupdate', updateCurrentTime);
      }
    };
  }, [playerRef]);

  return (
    <div className="grid grid-cols-4 max-w-screen-2xl mx-auto">
      <div className="col-span-3">
        <VideoPlayer
          ref={playerRef}
          controls
          height={400}
          src={videoUrl}
          type="video/mp4"
        />
        <VideoFramesList
          videoSrc={videoUrl}
          intervals={[5, 10, 20, 30, 50, 54]}
          progress={currentTime / duration * 100}
          onChangeCurrentTime={changeCurrentTime}
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

  function changeCurrentTime(newProgress: number) {
    playerRef.current?.currentTime(newProgress * duration);
  }
}
