import { FunctionComponent, useEffect, useRef } from 'react';
import videojs from 'video.js';

import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

export interface VideoPlayerProps {
  src: string,

  controls?: boolean,
  responsive?: boolean,
  fluid?: boolean,
  height?: string | number,
  onReady?: () => void,
}

export const VideoPlayer: FunctionComponent<VideoPlayerProps> = ({
  src,

  controls,
  responsive,
  fluid,
  height,
  onReady,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');

      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        sources: [{
          src,
        }],
        controls,
        responsive,
        fluid,
        height,
      }, onReady);
    }
  }, [
    src,
    controls,
    responsive,
    fluid,
    height,
    onReady,
    videoRef,
  ]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};
