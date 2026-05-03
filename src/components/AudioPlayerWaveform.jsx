import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import AudioZoomControls from "./AudioZoomControls";

export default function AudioWavePlayer({ audioPath }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localFile, setLocalFile] = useState(null);

  //
  // 1️⃣ INIT WAVESURFER
  //
  useEffect(() => {
    if (!containerRef.current) return;

    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#d1d5db",
      progressColor: "#3b82f6",
      height: 120,
      responsive: true,
    });

    waveRef.current.on("finish", () => setIsPlaying(false));

    return () => waveRef.current?.destroy();
  }, []);

  //
  // 2️⃣ LOAD AUDIO WHEN audioPath CHANGES (Electron)
  //
  useEffect(() => {
    if (!audioPath || !waveRef.current) return;

    waveRef.current.load("file://" + audioPath);
  }, [audioPath]);

  //
  // 3️⃣ LOAD AUDIO WHEN local file selected (HTML input)
  //
  useEffect(() => {
    if (!localFile || !waveRef.current) return;

    const url = URL.createObjectURL(localFile);
    waveRef.current.load(url);

    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  //
  // 4️⃣ APPLY ZOOM
  //
  const applyZoom = (z) => {
    waveRef.current?.zoom(z);
  };

  //
  // 5️⃣ PLAY / PAUSE
  //
  const togglePlay = () => {
    if (!waveRef.current) return;
    waveRef.current.playPause();
    setIsPlaying(waveRef.current.isPlaying());
  };

  return (
    <div className="p-4 space-y-4 w-full">
      
      {/* File import (optional for testing) */}
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files?.[0]) setLocalFile(e.target.files[0]);
        }}
        className="block text-sm"
      />

      {/* Waveform */}
      <div
        ref={containerRef}
        className="w-full border rounded bg-gray-100"
      />

      {/* Zoom Controls */}
      <AudioZoomControls
        zoom={zoom}
        setZoom={setZoom}
        onChange={applyZoom}
      />

      {/* Play Button */}
      <button
        onClick={togglePlay}
        disabled={!audioPath && !localFile}
        className={`py-2 px-4 rounded text-white font-bold ${
          audioPath || localFile
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
