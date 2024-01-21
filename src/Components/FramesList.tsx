import { FunctionComponent, useEffect, useState } from 'react';

export interface FramesListProps {
  videoSrc: string,
  interval?: number;
  intervals?: number[];
}

export const VideoFramesList: FunctionComponent<FramesListProps> = ({
  videoSrc,

  interval = 5,
  intervals = [],
}) => {
  const [videoFramesList, setVideoFramesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    <div className="flex h-60 gap-1 max-w-full overflow-auto">
      {
        isLoading
          ? (
            'Loading ...'
          )
          : (
            videoFramesList.map((image, idx) => (
              <img key={idx} src={image} />
            ))
          )
      }
    </div>
  );
};
