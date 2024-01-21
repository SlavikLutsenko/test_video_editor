import { forwardRef, useEffect, useRef } from 'react';
import videojs from 'video.js';

import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

export interface VideoPlayerProps {
  src: string,
  type: string,

  controls?: boolean,
  responsive?: boolean,
  fluid?: boolean,
  height?: string | number,
  onReady?: () => void,
}

export const VideoPlayer = forwardRef<Player, VideoPlayerProps>(({
  src,
  type,

  controls,
  responsive,
  fluid,
  height,
  onReady,
}, ref) => {
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
          type,
        }],
        controls,
        responsive,
        fluid,
        height,
      }, onReady);

      if (typeof ref === 'function') {
        ref(playerRef.current);
      }
      else if (ref) {
        ref.current = playerRef.current;
      }
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
});
