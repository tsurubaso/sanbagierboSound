// File: src/components/SoundPlayerWave.jsx

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

export default function SoundPlayerWave({ onAudioBuffer }) {
  const waveformRef = useRef(null);
  const timelineTopRef = useRef(null);
  const wsRef = useRef(null);

  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioInfo, setAudioInfo] = useState(null);
  const audioCtxRef = useRef(null);

  // INIT WaveSurfer (UNE SEULE FOIS)
  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      height: 128,
      waveColor: "#ff4e00",
      progressColor: "#dd5e98",
      cursorColor: "#dde8d4",
      cursorWidth: 2,
      minPxPerSec: zoom,
      normalize: false,
      autoScroll: true,
      autoCenter: true,

      plugins: [
        TimelinePlugin.create({
          container: timelineTopRef.current,
          height: 24,
          timeInterval: 0.5,
          primaryLabelInterval: 5,
          secondaryLabelInterval: 1,
          style: {
            fontSize: "14px",
            color: "#4ea4ff",
          },
        }),

        TimelinePlugin.create({
          height: 18,
          timeInterval: 0.1,
          primaryLabelInterval: 1,
          style: {
            fontSize: "10px",
            color: "#ff66cc",
          },
        }),
      ],
    });

    wsRef.current = ws;

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      setIsPlaying(false);
      ws.setTime(0);
    });

    return () => ws.destroy();
  }, []);

  // LOAD AUDIO (MANUEL)
  const handleLoadAudio = async () => {
    if (!wsRef.current) return;

    const audio = await window.electronAPI.openAudio();
    if (!audio) return;

    wsRef.current.load(audio.url);

    // récupérer AudioBuffer pour traitements futurs
    const response = await fetch(audio.url);
    const arrayBuffer = await response.arrayBuffer();

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

    const data = {
      audioBuffer,
      path: audio.path,
    };

    setAudioInfo(data);
    if (onAudioBuffer) onAudioBuffer(data);
  };

  // Zoom
  const handleZoom = (e) => {
    const value = e.target.valueAsNumber;
    setZoom(value);
    if (wsRef.current) wsRef.current.zoom(value);
  };

  const togglePlay = () => {
    if (!wsRef.current) return;
    wsRef.current.playPause();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLoadAudio}
          className="px-4 py-2 bg-green-600 rounded-lg"
        >
          Choisir bande son
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <label className="flex items-center gap-2">
          <span>Zoom</span>
          <input
            type="range"
            min={10}
            max={1200}
            value={zoom}
            onChange={handleZoom}
          />
          <span>{zoom}</span>
        </label>
      </div>

      {/* Wave */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-2">
        <div ref={timelineTopRef} className="w-full h-[20px]" />
        <div ref={waveformRef} className="w-full h-[150px]" />
      </div>

      {/* Info */}
      {audioInfo && (
        <div className="text-gray-300 text-sm">
          <p>Path: {audioInfo.path}</p>
          <p>Duration: {audioInfo.audioBuffer.duration.toFixed(2)} s</p>
        </div>
      )}
    </div>
  );
}

/*

OPTIONS WAVESURFER (REFERENCE)

{
  "container": null,
  "height": 128,
  "width": null,
  "splitChannels": false,
  "normalize": false,
  "waveColor": "#ff4e00",
  "progressColor": "#dd5e98",
  "cursorColor": "#dde8d4",
  "cursorWidth": 2,
  "barWidth": null,
  "barGap": null,
  "barRadius": null,
  "barHeight": null,
  "barAlign": "",
  "minPxPerSec": 1,
  "fillParent": true,
  "url": null,
  "mediaControls": true,
  "autoplay": false,
  "interact": true,
  "dragToSeek": false,
  "hideScrollbar": false,
  "audioRate": 1,
  "autoScroll": true,
  "autoCenter": true,
  "sampleRate": 8000
}

*/
