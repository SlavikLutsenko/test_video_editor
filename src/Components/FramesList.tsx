import { FunctionComponent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Subtitle } from 'interfaces/subtitle';
import Slider from 'rc-slider';
import { twMerge } from 'tailwind-merge';

import Player from 'video.js/dist/types/player';

import 'rc-slider/assets/index.css';

export interface FramesListProps {
  videoSrc: string,
  subtitleList: Subtitle[];
  videoPlayer: Player;
  duration: number;
  onChangeCurrentTime: (newProgress: number) => void;
  startProgress: number;
  endProgress: number;
  onChangeProgressLength: (newProgressLength: number[]) => void;
  onRemoveFrame: (startTime: number, endTime: number) => void;

  frameClassName?: string;
}

export const VideoFramesList: FunctionComponent<FramesListProps> = ({
  videoSrc,
  subtitleList,
  videoPlayer,
  duration,
  onChangeCurrentTime,
  startProgress = 0,
  endProgress = 100,
  onChangeProgressLength,
  onRemoveFrame,

  frameClassName,
}) => {
  const [videoFramesList, setVideoFramesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const progressRef = useRef<HTMLDivElement>(null);
  const frameListRef = useRef<HTMLDivElement>(null);
  const playerVideoFrameCallbackID = useRef<number>(0);

  const changeProgressPosition = useCallback(
    () => {
      const videoEl = videoPlayer?.tech(true);

      if (progressRef.current) {
        progressRef.current.style.left = `calc(${(videoPlayer.currentTime() || 0) / (videoPlayer.duration() || 1) * 100}% - 0.25rem)`;
      }
      if (videoEl) {
        playerVideoFrameCallbackID.current = videoEl.requestVideoFrameCallback(changeProgressPosition);
      }
    },
    [videoPlayer, progressRef]
  );

  useEffect(() => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const images: string[] = [];
    const intervals = subtitleList.map(({ startTime }) => startTime);

    video.crossOrigin = 'anonymous';
    video.volume = 0;
    video.src = videoSrc;
    video.play();

    const handleDurationChange = () => {
      let videoCurrentTime = 0;

      const extractFrame = () => {
        // If you pass intervals, frames will be created only in those seconds when it is needed
        if (videoCurrentTime < video.duration && intervals?.[images.length]) {
          videoCurrentTime += intervals?.[images.length] - (intervals?.[images.length - 1] || 0);
          video.currentTime = videoCurrentTime;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

          images.push(canvas.toDataURL());

          video.requestVideoFrameCallback(extractFrame);
        }
        else {
          setVideoFramesList(images);
          setIsLoading(false);
        }
      };

      video.requestVideoFrameCallback(extractFrame);
      video.currentTime = 0;
    };

    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, []);

  useEffect(
    () => {
      const videoEl = videoPlayer?.tech(true);

      if (videoEl) {
        playerVideoFrameCallbackID.current = videoEl.requestVideoFrameCallback(changeProgressPosition);
        videoPlayer.on('timeupdate', changeProgressPosition);
      }

      return () => {
        if (videoPlayer) {
          videoPlayer.off('timeupdate', changeProgressPosition);
          videoEl?.cancelVideoFrameCallback(playerVideoFrameCallbackID.current);
        }
      };
    },
    [videoPlayer, progressRef, changeProgressPosition]
  );

  return (
    <div className="space-y-3">
      <div
        ref={frameListRef}
        className="max-w-full overflow-auto relative gap-[2px] flex cursor-pointer"
        onClick={onChangeProgress}
      >
        {
          isLoading
            ? (
              <div className="text-5xl text-blue-500 p-7 mx-auto animate-spin">
                <FontAwesomeIcon icon={faSpinner} />
              </div>
            )
            : (
              <>
                {
                  videoFramesList.map((image, idx) => (
                    <div
                      key={idx}
                      className={twMerge(
                        'relative',
                        !subtitleList[idx].isRemoved && '[&>button]:hover:block',
                        subtitleList[idx].isRemoved && `
                          after:absolute after:top-0 after:w-full after:h-full after:z-10 after:bg-red-400 after:bg-opacity-45
                        `
                      )}
                      style={{
                        width: `${(subtitleList[idx].endTime - subtitleList[idx].startTime + 0.2) / duration * 100}%`,
                      }}
                    >
                      <img className={frameClassName} src={image} />
                      <button
                        className="
                          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-2xl hidden
                        "
                        onClick={event => removeFrame(event, idx)}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  ))
                }
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full w-1 bg-red-500 transition-all ease-linear duration-75"
                />
              </>
            )
        }
      </div>
      {
        !isLoading && (
          <Slider
            className="px-1"
            range
            step={0.01}
            min={0}
            max={100}
            defaultValue={[startProgress, endProgress]}
            pushable
            // @ts-expect-error - onChange requires the parameter number | number[]
            // But we are a range parameter, so the parameter can only be number[]
            onChange={onChangeProgressLength}
          />
        )
      }
    </div>
  );

  function onChangeProgress({ clientX }: MouseEvent) {
    if (frameListRef.current) {
      const { left, width } = frameListRef.current.getBoundingClientRect();

      onChangeCurrentTime((clientX - left) / width);
    }
  }

  function removeFrame(event: MouseEvent, idx: number) {
    event.preventDefault();
    event.stopPropagation();

    onRemoveFrame(
      subtitleList[idx].startTime,
      subtitleList[idx + 1]?.startTime || subtitleList[idx].endTime
    );
  }
};
