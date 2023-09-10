import React, { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function App() {
  const ffmpegRef = useRef(new FFmpeg());
  const [loaded, setLoaded] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [gif, setGif] = useState<any>();

  const load = async () => {
    // todo: use multi threaded version
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
  };

  const ffmpeg = ffmpegRef.current;

  const convertToGif = async () => {
    if (video == null) {
      return;
    }

    // write file to memory
    ffmpeg.writeFile("test.mp4", await fetchFile(video));

    // run the FFMpeg command
    await ffmpeg.exec(["-i", "test.mp4", "output.gif"]);

    // read the result
    const data = await ffmpeg.readFile("output.gif");

    // create the url
    const url = URL.createObjectURL(
      new Blob([(data as any).buffer], { type: "image/gif" })
    );
    setGif(url);
  };

  useEffect(() => {
    load();
  }, []);

  if (!loaded) {
    return <div>Loading</div>;
  }

  return (
    <>
      {video && (
        <>
          <video controls width="250" src={URL.createObjectURL(video)}></video>
          <button onClick={convertToGif}>convert</button>
        </>
      )}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.item(0);
          if (file != null) {
            setVideo(file);
          }
        }}
      />
      {gif && <img src={gif} alt="gif" width="250" />}
    </>
  );
}

export default App;
