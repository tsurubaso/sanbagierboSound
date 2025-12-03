// src/pages/plugins/TimelineDualPlugin.jsx
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

export default function TimelinePluginFunc() {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      minPxPerSec: zoom,
      plugins: [
        // --- Top timeline (coarse scale) ---
        TimelinePlugin.create({
          container: '#timeline',
          height: 24,
          timeInterval: 0.5,
          primaryLabelInterval: 5,
          secondaryLabelInterval: 1,
          style: {
            fontSize: "14px",
            color: "#4ea4ff",
            top: "0px",
          },
        }),

        // --- Bottom timeline (fine scale) ---
        TimelinePlugin.create({
          height: 18,
          timeInterval: 0.1,
          primaryLabelInterval: 1,
          style: {
            fontSize: "10px",
            color: "#ff66cc",
            top: "0px",
          },
        }),
      ],
    });

    wsRef.current = ws;

    // Load audio via Electron preload
    window.electronAPI.openAudio().then((audio) => {
      if (!audio) return;
      ws.load(audio.url);
    });

    ws.on("interaction", () => ws.play());
    ws.on("finish", () => ws.setTime(0));

    return () => ws.destroy();
  }, []);

  // Zoom handler (no reload!)
  const handleZoomChange = (e) => {
    const value = e.target.valueAsNumber;
    setZoom(value);
    if (wsRef.current) wsRef.current.zoom(value);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dual Timeline Plugin</h1>

      <p className="text-gray-300 max-w-2xl">
        Two synchronized timelines: one coarse scale (seconds) and one fine
        scale (sub-seconds).
      </p>

      {/* Zoom slider */}
      <label className="flex items-center gap-4">
        <span className="text-gray-300">Zoom:</span>
        <input
          type="range"
          min={10}
          max={1200}
          value={zoom}
          onChange={handleZoomChange}
          className="flex-1"
        />
        <span className="text-gray-300">{zoom}</span>
      </label>

      {/* WaveSurfer Container */}
      <div className="rounded-xl bg-gray-900 p-4 shadow-xl border border-gray-700 space-y-2">
        {/* Tailwind background so timelines stand out */}
       <div id="timeline" className="w-full h-[20px]"></div>
  <div ref={containerRef} className="w-full h-[150px]"></div>
      </div>

      <a
        className="text-blue-400 hover:underline"
        href="https://wavesurfer.xyz/docs/modules/plugins_timeline"
        target="_blank"
      >
        Timeline Plugin Docs
      </a>
    </div>
  );
}
