// File: src/pages/Home.jsx
import SoundPlayerWave from "../components/SoundPlayerWave";
import MicRecorder from "../components/MicRecorder";

export default function Home() {
  const handleAudioBuffer = (data) => {
    console.log("AudioBuffer ready:", data);
  };

  return (
    <div className="p-6 text-gray-200 space-y-6">
      <h1 className="text-3xl font-bold">Audio Studio</h1>

      {/* PLAYER */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-4">Player</h2>
        <SoundPlayerWave onAudioBuffer={handleAudioBuffer} />
      </div>

      {/* RECORDER */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow">
        <h2 className="text-xl font-semibold mb-4">Recorder</h2>
        <MicRecorder />
      </div>
    </div>
  );
}