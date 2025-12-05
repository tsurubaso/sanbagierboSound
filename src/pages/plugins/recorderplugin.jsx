import MicRecorder from "../../components/MicRecorder";

export default function RecorderPluginPage() {
  return (
    <div className="w-full h-full p-6 flex flex-col text-white bg-gray-950">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">
        🎙 Recorder Plugin Demo
      </h1>

      {/* Description */}
      <p className="text-gray-300 mb-6 max-w-2xl leading-relaxed">
        This page demonstrates the Wavesurfer Record Plugin running inside
        React + Electron. You can select a microphone, record audio, pause,
        resume, and playback the recorded audio.
      </p>

      {/* Recorder Component */}
      <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <MicRecorder />
      </div>
    </div>
  );
}
