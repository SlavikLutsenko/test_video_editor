import { VideoFramesList } from 'Components/FramesList';
import { VideoPlayer } from 'Components/VideoPlayer';

export default function App() {
  return (
    <>
      <VideoPlayer
        controls
        height={400}
        src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      />
      <VideoFramesList
        videoSrc="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        intervals={[5, 10, 20, 30, 50, 54]}
      />
    </>
  );
}
