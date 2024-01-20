import { VideoPlayer } from 'Components/VideoPlayer';

export default function App() {
  return (
    <>
      <VideoPlayer
        controls
        height={400}
        src="https://download.samplelib.com/mp4/sample-10s.mp4"
      />
    </>
  );
}
