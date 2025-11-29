import React, { useRef, useState, useEffect } from "react";
import { useWaveSurfer } from "./wavesurfer";
import AudioZoomControls from "./AudioZoomControls";

export default function App() {
  const containerRef = useRef();
  const [file, setFile] = useState(null);      // { url, path }
  const [region, setRegion] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  const wave = useWaveSurfer(containerRef, file, setRegion, zoom);

  useEffect(() => {
    console.log("App rendered, current file:", file);
  });

  const selectFile = async () => {
    console.log("Opening audio file...");
    const selected = await window.electronAPI.openAudio();
    console.log("File selected:", selected);
    if (selected) setFile(selected);
  };

  const deleteRegion = async () => {
    if (!file || !region) return;

    console.log("Deleting region:", region);

    const output = await window.electronAPI.deleteRegion({
      file,
      start: region.start,
      end: region.end
    });

    console.log("New file returned after region delete:", output);

    setFile(output);
    setRegion(null);
  };

  const togglePlay = () => {
    if (!wave?.current) return;
    console.log("Play/pause clicked");
    wave.current.playPause();
    setIsPlaying(wave.current.isPlaying());
  };

  const applyZoom = (z) => {
    console.log("Applying zoom:", z);
    wave.current?.zoom(z);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={selectFile}>Open audio</button>
      <button onClick={deleteRegion} disabled={!region}>Delete selection</button>
      <button
        onClick={togglePlay}
        disabled={!file}
        style={{ marginLeft: 10 }}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <AudioZoomControls
        zoom={zoom}
        setZoom={setZoom}
        onChange={applyZoom}
      />

      <div
        ref={containerRef}
        style={{
          marginTop: 20,
          width: "100%",
          height: 200,
          border: "1px solid #aaa"
        }}
      />
    </div>
  );
}
