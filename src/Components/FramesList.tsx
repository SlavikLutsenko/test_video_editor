import { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';

export interface FramesListProps {
  videoSrc: string,

  interval?: number;
  intervals?: number[];
  frameClassName?: string;
  progress?: number;
  onChangeCurrentTime?: (newProgress: number) => void;
}

export const VideoFramesList: FunctionComponent<FramesListProps> = ({
  videoSrc,

  interval = 5,
  intervals = [],
  frameClassName,
  progress,
  onChangeCurrentTime,
}) => {
  const [videoFramesList, setVideoFramesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const frameListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const images: string[] = [];

    video.crossOrigin = 'anonymous';
    video.volume = 0;
    video.src = videoSrc;
    video.play();

    const handleDurationChange = () => {
      let currentTime = 0;

      const extractFrame = () => {
        // If you pass intervals, frames will be created only in those seconds when it is needed
        if (currentTime < video.duration && (intervals?.length ? intervals?.[images.length] : true)) {
          currentTime += intervals?.length
            ? intervals?.[images.length] - (intervals?.[images.length - 1] || 0)
            : interval;
          video.currentTime = currentTime;

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
        className="grid max-w-full overflow-auto grid-flow-col relative cursor-pointer"
      >
        {
          isLoading
            ? (
              'Loading ...'
            )
            : (
              videoFramesList.map((image, idx) => (
                <img key={idx} className={frameClassName} src={image} />
              ))
            )
        }
        <div
          className="
            h-full bg-red-300 bg-opacity-30 border-r-2 border-red-400
            absolute left-0 top-0
            transition-all ease-linear duration-200
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
      <p>
        Progress:
      </p>
      <input
        type="range"
        className="w-full"
        value={progress}
        onChange={onChangeProgress}
        min="0"
        max="100"
      />
    </>
  );

  function onChangeProgress({ target: { valueAsNumber } }: ChangeEvent<HTMLInputElement>) {
    if (onChangeCurrentTime) {
      onChangeCurrentTime(valueAsNumber / 100);
    }
  }
};
