import { useState } from 'react';

import { VideoFramesList } from 'Components/FramesList';
import { VideoPlayer } from 'Components/VideoPlayer';

import { getCloudinaryVideoUrl } from 'services/cloudinary';

export default function App() {
  const [videoUrl] = useState(getCloudinaryVideoUrl('test_video_editor/xqveap7pjub52c4dpyvy'));

  return (
    <>
      <VideoPlayer
        controls
        height={400}
        src={videoUrl}
        type="video/mp4"
      />
      <VideoFramesList
        videoSrc={videoUrl}
        intervals={[5, 10, 20, 30, 50, 54]}
      />
    </>
  );
}
