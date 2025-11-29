import React, { useRef, useState } from "react";
import { useWaveSurfer } from "./wavesurfer";

export default function App() {
  const containerRef = useRef();
  const [file, setFile] = useState(null);
  const [region, setRegion] = useState(null);

  const wave = useWaveSurfer(containerRef, file, setRegion);

  const selectFile = async () => {
    const selected = await window.electronAPI.openAudio();
    if (selected) setFile(selected);
  };

  const deleteRegion = async () => {
    if (!file || !region) return;

    const output = await window.electronAPI.deleteRegion({
      file,
      start: region.start,
      end: region.end
    });

    setFile(output);
    setRegion(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={selectFile}>Open audio</button>
      <button onClick={deleteRegion} disabled={!region}>Delete selection</button>

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
