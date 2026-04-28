// File: src/components/AudioLoaderWave.jsx
import React, { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioLoaderWave({ onAudioBuffer }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // -------------------------------
  // Load audio from Electron File Dialog
  // -------------------------------
  const selectFile = async () => {
    const audio = await window.electronAPI.openAudio(); // returns {url, path}
    if (!audio) return;

    setFile(audio);

    // Decode ArrayBuffer into AudioBuffer for editing
    const arrayBuffer = await fetch(audio.url).then(res => res.arrayBuffer());
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Pass decoded AudioBuffer back to parent/page
    if (onAudioBuffer) onAudioBuffer({ audioBuffer, path: audio.path });
  };

  // -------------------------------
  // Initialize WaveSurfer
  // -------------------------------
  useEffect(() => {
    if (!file || !containerRef.current) return;

    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
      setIsReady(false);
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#888",
      progressColor: "#4f46e5",
      height: 150,
      barWidth: 2,
      cursorWidth: 1,
    });

    waveRef.current = ws;

    ws.load(file.url);

    ws.on("ready", () => setIsReady(true));

    return () => ws.destroy();
  }, [file]);

  // -------------------------------
  // Play/Pause
  // -------------------------------
  const togglePlay = () => {
    if (waveRef.current) waveRef.current.playPause();
  };

  return (
    <div className="space-y-4">
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={selectFile}
      >
        Open Audio
      </button>

      <button
        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-700"
        onClick={togglePlay}
        disabled={!isReady}
      >
        Play / Pause
      </button>

      <div
        ref={containerRef}
        className="w-full h-[150px] border border-gray-700 rounded"
      />
    </div>
  );
}

