// src/pages/plugins/TimelinePluginPage.jsx
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

export default function TimelinePluginFunc() {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      minPxPerSec: zoom,
      plugins: [TimelinePlugin.create()], 
    });

    wsRef.current = ws;

    window.electronAPI.openAudio().then((audio) => {
      if (!audio) return;
      ws.load(audio.url);
    });

    ws.on("interaction", () => ws.play());
    ws.on("finish", () => ws.setTime(0));

    return () => ws.destroy();
  }, []);

const handleZoomChange = (e) => {
  const value = e.target.valueAsNumber;
  setZoom(value);
  if (wsRef.current) wsRef.current.zoom(value); // DOES NOT recreate WS
};

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Timeline Plugin</h1>

      <p className="text-gray-300 max-w-2xl">
        Displays a timeline above the waveform, showing time in seconds or
        formatted units.
      </p>

      <label className="flex items-center gap-2">
        <span className="text-gray-300">Zoom:</span>
        <input
          type="range"
          min={10}
          max={1000}
          value={zoom}
          onChange={handleZoomChange}
          className="flex-1"
        />
        <span className="text-gray-300">{zoom}</span>
      </label>

      <div className="rounded-xl bg-gray-300 p-4 shadow">
        <div ref={containerRef} className="w-full h-[150px]"></div>
      </div>

      <a
          className="text-blue-400 hover:underline"
          href="https://wavesurfer.xyz/docs/classes/plugins_timeline.TimelinePlugin"
          target="_blank"
        >Timeline Plugin Docs</a>

    </div>
  );
}
