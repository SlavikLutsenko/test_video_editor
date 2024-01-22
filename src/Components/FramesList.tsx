import { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Subtitle } from 'interfaces/subtitle';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

export interface FramesListProps {
  videoSrc: string,
  subtitleList: Subtitle[];
  currentTime: number;
  duration: number;

  frameClassName?: string;
  // progress?: number;
  onChangeCurrentTime?: (newProgress: number) => void;
  startProgress?: number;
  endProgress?: number;
  onChangeProgressLength?: (newProgressLength: number[]) => void;
  onRemoveFrame?: (startTime: number, endTime: number) => void;
}

export const VideoFramesList: FunctionComponent<FramesListProps> = ({
  videoSrc,
  subtitleList,
  currentTime,
  duration,

  frameClassName,
  // progress,
  onChangeCurrentTime,
  startProgress = 0,
  endProgress = 100,
  onChangeProgressLength,
  onRemoveFrame,
}) => {
  const [videoFramesList, setVideoFramesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const frameListRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <div
        ref={frameListRef}
        className="max-w-full overflow-auto relative gap-[2px] flex"
      >
        {
          isLoading
            ? (
              'Loading ...'
            )
            : (
              videoFramesList.map((image, idx) => (
                <div
                  key={idx}
                  className="relative [&>button]:hover:block"
                  style={{
                    width: `${(subtitleList[idx].endTime - subtitleList[idx].startTime) / duration * 100}%`,
                  }}
                >
                  <img className={frameClassName} src={image} />
                  <br />
                  {subtitleList[idx].startTime}
                  {' '}
                  -
                  {' '}
                  {subtitleList[idx].endTime}
                  {
                    onRemoveFrame && (
                      <button
                        className="
                          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-2xl hidden
                        "
                        onClick={() => onRemoveFrame(
                          subtitleList[idx].startTime,
                          subtitleList[idx + 1]?.startTime || subtitleList[idx].endTime
                        )}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )
                  }
                </div>
              ))
            )
        }
      </div>
      <p>
        Progress:
      </p>
      <input
        type="range"
        className="w-full"
        value={currentTime}
        onChange={onChangeProgress}
        min="0"
        max={duration}
      />
      <Slider
        range
        step={0.1}
        min={0}
        max={100}
        defaultValue={[startProgress, endProgress]}
        pushable
        // @ts-expect-error - onChange requires the parameter number | number[]
        // But we are a range parameter, so the parameter can only be number[]
        onChange={onChangeProgressLength}
      />
    </>
  );

  function onChangeProgress({ target: { valueAsNumber } }: ChangeEvent<HTMLInputElement>) {
    if (onChangeCurrentTime) {
      onChangeCurrentTime(valueAsNumber / 100);
    }
  }
};
