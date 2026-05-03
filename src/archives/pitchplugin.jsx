import React, { useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function PitchPlugin() {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const canvasRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  const [file, setFile] = useState(null);

  // Load audio using Electron API
  const loadAudio = async () => {
    const audio = await window.electronAPI.openAudio();
    if (!audio) return;
    setFile(audio);

    // Destroy previous waveform
    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    // Create new worker
    const pitchWorker = new Worker("/workers/pitch-worker.js", {
      type: "module",
    });

    // Create WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(200, 200, 200, 0.5)",
      progressColor: "rgba(100, 100, 100, 0.5)",
      height: 150,
      minPxPerSec: 200,
      sampleRate: 11025,
    });

    waveRef.current = ws;

    ws.load(audio.url);

    // Once decoded -> send peaks to worker
    ws.on("decode", () => {
      setProcessing(true);
      const data = ws.getDecodedData();
      const peaks = data.getChannelData(0);
      pitchWorker.postMessage({
        peaks,
        sampleRate: ws.options.sampleRate,
      });
    });
    ws.on("click", () => ws.playPause());
    // Receive frequency array
    pitchWorker.onmessage = (e) => {
      const { frequencies, baseFrequency } = e.data;

      drawPitchCanvas(frequencies, baseFrequency);
      setProcessing(false);
    };
  };

  // Draw pitch graph on canvas
  const drawPitchCanvas = (frequencies, baseFreq) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = frequencies.length;
    canvas.height = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const upColor = "#385587";
    const downColor = "#C26351";

    let prevY = 0;

    frequencies.forEach((freq, i) => {
      if (!freq) return;

      const y = Math.round(
        canvas.height - (freq / (baseFreq * 2)) * canvas.height
      );
      ctx.fillStyle = y > prevY ? downColor : upColor;

      ctx.fillRect(i, y, 2, 2);
      prevY = y;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pitch Detection Plugin</h1>

        <button
          onClick={loadAudio}
          disabled={processing}
          className={
            "px-4 py-2 rounded text-white " +
            (processing ? "bg-gray-500" : "bg-blue-600")
          }
        >
          {processing ? "Processing..." : "Load audio"}
        </button>
      <button
        onClick={() => waveRef.current?.playPause()}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Play / Pause
      </button>

      <div ref={containerRef} className="mt-4 border h-40" />

      <p className="mt-4 font-semibold">Pitch Visualization</p>

      <canvas ref={canvasRef} className="w-full border h-24 mt-2" />
    </div>
  );
}
