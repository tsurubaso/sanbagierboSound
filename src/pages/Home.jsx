// File: src/pages/Home.jsx
import { useState } from "react";
import AudioLoaderWave from "../components/AudioLoaderWave";
export default function Home() {

      const [audioData, setAudioData] = useState(null); // { audioBuffer, path }

  const handleAudioBuffer = (data) => {
    setAudioData(data);
    console.log("AudioBuffer ready:", data);
    // Here you can implement trimming, region creation, or other processing
  };

  return (
    <div className="p-6 text-gray-200 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Sound Training</h1>

      <p className="text-gray-300 leading-relaxed">
        This section introduces the{" "}
        <span className="font-semibold text-indigo-400">Wavesurfer.js</span>{" "}
        library — a powerful and lightweight tool for visualizing and
        interacting with audio waveforms. You can learn more at the official
        site:
        <br />
        <a
          href="https://wavesurfer.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 underline hover:text-indigo-300"
        >
          wavesurfer.xyz
        </a>
      </p>

      <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">What is Wavesurfer?</h2>
        <p className="text-gray-300 mb-3">Wavesurfer.js allows you to:</p>
        <ul className="list-disc list-inside text-gray-400 space-y-1">
          <li>Render beautiful audio waveforms</li>
          <li>Play, pause, mute, and navigate in audio</li>
          <li>Add draggable regions and markers</li>
          <li>Zoom and scroll waveforms</li>
          <li>Sync multiple tracks</li>
        </ul>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <p className="text-gray-300 mb-3">
          Here is a visual example of a Wavesurfer waveform:
        </p>
        <img
          src="/wavesurferImage.png"
          alt="Wavesurfer example waveform"
          className="rounded-lg border border-gray-700 shadow-md"
        />
      </div>
<div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
          <div className="p-6 text-gray-200 space-y-6">
            <h1 className="text-3xl font-bold">Sound Training</h1>
            <p className="text-gray-300">
              Load an audio file and visualize its waveform using Wavesurfer.js.
              The AudioBuffer is available for editing once loaded.
            </p>
      
            <AudioLoaderWave onAudioBuffer={handleAudioBuffer} />
      
            {audioData && (
              <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
                <h2 className="text-xl font-semibold mb-2">Audio Info</h2>
                <p className="text-gray-300">Path: {audioData.path}</p>
                <p className="text-gray-300">Duration: {audioData.audioBuffer.duration.toFixed(2)} s</p>
              </div>
            )}
          </div>
    </div>
    </div>
  );
}
