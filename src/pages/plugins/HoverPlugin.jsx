// src/pages/plugins/HoverPlugin.jsx
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js";

export default function HoverPluginPage() {
  const containerRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      height: 120,
      plugins: [
        Hover.create({
          lineColor: "#ff0000",
          lineWidth: 2,
          labelBackground: "#555",
          labelColor: "#fff",
          labelSize: "11px",
          labelPreferLeft: false,
        }),
      ],
    });

    wsRef.current = ws;

    // load audio from preload exposed API
    window.electronAPI.openAudio().then((audio) => {
      if (!audio) return;
      ws.load(audio.url);
    });

    ws.on("interaction", () => ws.play());

    return () => ws.destroy();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-gray-500 text-3xl font-bold">Hover Plugin</h1>

      <p className="text-gray-300 max-w-2xl">
        Shows a vertical line and a label with the timestamp when hovering over
        the waveform.
      </p>

      <div className="rounded-xl bg-gray-900 p-4 shadow">
        <div ref={containerRef} className="w-full h-[150px]"></div>
      </div>
      <a
        className="text-blue-400 hover:underline"
        href="https://wavesurfer.xyz/docs/classes/plugins_hover.HoverPlugin"
        target="_blank"
      >
        Hover Plugin Docs
      </a>
    </div>
  );
}
