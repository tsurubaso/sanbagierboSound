import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  Play,
  Pause,
  Music2,
  FolderOpen,
  ZoomIn,
} from "lucide-react";

export default function AudioWavePlayer({ audioPath }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);

  const [zoom, setZoom] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  //
  // FORMAT TIME
  //
  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  //
  // INIT WAVESURFER
  //
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#374151",
      progressColor: "#60a5fa",
      cursorColor: "#ffffff",
      barWidth: 2,
      barGap: 1,
      barRadius: 4,
      height: 110,
      normalize: true,
      responsive: true,
      dragToSeek: true,
    });

    waveRef.current = ws;

    ws.on("ready", () => {
      setDuration(formatTime(ws.getDuration()));
    });

    ws.on("audioprocess", () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on("seek", () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on("finish", () => {
      setIsPlaying(false);
    });

    return () => ws.destroy();
  }, []);

  //
  // ELECTRON AUDIO LOAD
  //
  useEffect(() => {
    if (!audioPath || !waveRef.current) return;

    waveRef.current.load("file://" + audioPath);
  }, [audioPath]);

  //
  // LOCAL FILE LOAD
  //
  useEffect(() => {
    if (!localFile || !waveRef.current) return;

    const url = URL.createObjectURL(localFile);

    waveRef.current.load(url);

    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  //
  // PLAY / PAUSE
  //
  const togglePlay = () => {
    if (!waveRef.current) return;

    waveRef.current.playPause();

    setIsPlaying(waveRef.current.isPlaying());
  };

  //
  // ZOOM
  //
  const handleZoom = (e) => {
    const value = Number(e.target.value);

    setZoom(value);

    waveRef.current?.zoom(value);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-800 bg-[#111827] shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Music2 className="w-5 h-5 text-blue-400" />
          </div>

          <div>
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">
              Audio Workspace
            </h2>

            <p className="text-gray-400 text-xs">
              WaveSurfer Monitoring Panel
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-gray-400">
          {currentTime} / {duration}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-5">
        {/* IMPORT */}
        <label className="group flex items-center justify-center gap-3 border border-dashed border-gray-700 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all">
          <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />

          <div className="text-sm">
            <span className="text-white font-medium">
              Import audio file
            </span>

            <p className="text-xs text-gray-500">
              WAV, MP3, M4A supported
            </p>
          </div>

          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setLocalFile(e.target.files[0]);
              }
            }}
          />
        </label>

        {/* WAVEFORM */}
        <div className="rounded-xl border border-gray-800 bg-black p-4">
          <div ref={containerRef} className="w-full" />
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-4">
          {/* PLAY */}
          <button
            onClick={togglePlay}
            disabled={!audioPath && !localFile}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              audioPath || localFile
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>

          {/* ZOOM */}
          <div className="flex-1 flex items-center gap-3 bg-[#0f172a] border border-gray-800 rounded-xl px-4 py-3">
            <ZoomIn className="w-4 h-4 text-gray-400" />

            <input
              type="range"
              min={10}
              max={500}
              value={zoom}
              onChange={handleZoom}
              className="w-full cursor-pointer"
            />

            <span className="text-xs text-gray-300 font-mono w-10 text-right">
              {zoom}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}