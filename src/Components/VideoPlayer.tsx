import { forwardRef, useEffect, useRef } from 'react';
import { faCirclePlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { twMerge } from 'tailwind-merge';
import videojs from 'video.js';

import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

export interface VideoPlayerProps {
  src: string,
  type: string,
  onPlay: () => void;

  controls?: boolean,
  responsive?: boolean,
  fluid?: boolean,
  height?: string | number,
  onReady?: () => void,
  isPaused?: boolean;
}

export const VideoPlayer = forwardRef<Player, VideoPlayerProps>(({
  src,
  type,
  onPlay,

  controls,
  responsive,
  fluid,
  height,
  onReady,
  isPaused,
}, ref) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video-js');

      videoElement.setAttribute('id', 'test_edit_video');
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
    <div data-vjs-player className="relative [&>button]:hover:opacity-100">
      <div ref={videoRef} className="[&>video-js]:w-full" />
      <button
        className={twMerge(
          `
            text-5xl text-blue-600 w-12 h-12
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            transition-all duration-300 opacity-100
          `,
          !isPaused && 'opacity-0'
        )}
        onClick={
          isPaused
            ? onPlay
            : () => playerRef.current?.pause()
        }
      >
        {
          isPaused
            ? <FontAwesomeIcon icon={faCirclePlay} />
            : <FontAwesomeIcon icon={faPause} />
        }
      </button>
    </div>
  );
});
