// File: src/pages/Basic.jsx
import { useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Basic() {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const [file, setFile] = useState(null); // { url, path }

  const loadAudio = async () => {
    const audio = await window.electronAPI.openAudio();
    if (!audio) return;

    setFile(audio);

    // Cleanup previous instance
    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      height: 150,
    });

    waveRef.current = ws;

    ws.load(audio.url);

    ws.on('click', () => ws.play());
  };

  return (
    <div className="p-6 text-gray-200 space-y-4">
      <h1 className="text-3xl font-bold">Basic Wavesurfer Example</h1>
      <p className="text-gray-300">
        Load a local audio file and play it by clicking the waveform.
      </p>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={loadAudio}
      >
        Open Audio
      </button>

      <div
        ref={containerRef}
        className="w-full h-[150px] border border-gray-700 rounded"
      />
    </div>
  );
}
