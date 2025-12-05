import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function MicRecorder() {
  const micRef = useRef(null);
  const recWaveRef = useRef(null);
  const wavesurferRef = useRef(null);
  const recordRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [progressTime, setProgressTime] = useState("00:00");

  // -------------------------
  // Load audio devices
  // -------------------------
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((d) => {
      const mics = d.filter((dev) => dev.kind === "audioinput");
      setDevices(mics);
    });
  }, []);

  // -------------------------
  // Create Wavesurfer instance
  // -------------------------
  const initWaveSurfer = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: micRef.current,
      waveColor: "rgb(200,0,200)",
      progressColor: "rgb(100,0,100)",
      height: 120,
    });

    const record = ws.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true,
        continuousWaveform: false,
      })
    );

    // Save refs
    wavesurferRef.current = ws;
    recordRef.current = record;

    // Handle record end
    record.on("record-end", (blob) => {
      const url = URL.createObjectURL(blob);
      setRecordings((prev) => [...prev, { url, blob }]);
    });

    record.on("record-progress", (time) => {
      const mm = String(Math.floor((time % 3600000) / 60000)).padStart(2, "0");
      const ss = String(Math.floor((time % 60000) / 1000)).padStart(2, "0");
      setProgressTime(`${mm}:${ss}`);
    });
  };

  useEffect(() => {
    initWaveSurfer();
  }, []);

  // -------------------------
  // Start Recording
  // -------------------------
  const startRecording = async () => {
    const deviceId = selectedMic || undefined;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });

    await recordRef.current.startRecording(stream);

    setIsRecording(true);
    setIsPaused(false);
  };

  // -------------------------
  // Stop recording
  // -------------------------
  const stopRecording = () => {
    recordRef.current.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setProgressTime("00:00");
  };

  // -------------------------
  // Pause / Resume
  // -------------------------
  const togglePause = () => {
    if (!isRecording) return;

    if (isPaused) {
      recordRef.current.resumeRecording();
      setIsPaused(false);
    } else {
      recordRef.current.pauseRecording();
      setIsPaused(true);
    }
  };

  return (
    <div className="p-4 space-y-4 text-white">

      {/* Device select */}
      <div>
        <label className="block mb-1 font-semibold">Microphone</label>
        <select
          className="bg-gray-800 border border-gray-600 p-2 rounded w-full"
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
        >
          <option value="">Default input</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || d.deviceId}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-600 rounded"
          >
            🎙 Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 rounded"
          >
            ⏹ Stop
          </button>
        )}

        {isRecording && (
          <button
            onClick={togglePause}
            className="px-4 py-2 bg-yellow-600 rounded"
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        )}
      </div>

      {/* Time */}
      <div className="text-lg font-bold">{progressTime}</div>

      {/* Waveform */}
      <div
        ref={micRef}
        className="w-full h-[140px] border border-gray-700 rounded"
      />

      {/* Recordings list */}
      <div className="space-y-3">
        {recordings.map((r, index) => (
          <div key={index} className="bg-gray-900 p-3 rounded">
            <audio controls src={r.url} className="w-full" />
            <a
              href={r.url}
              download={`recording-${index}.webm`}
              className="text-blue-400 underline text-sm"
            >
              Download recording
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function MicRecorder() {
  const micRef = useRef(null);
  const recWaveRef = useRef(null);
  const wavesurferRef = useRef(null);
  const recordRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [progressTime, setProgressTime] = useState("00:00");

  // -------------------------
  // Load audio devices
  // -------------------------
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((d) => {
      const mics = d.filter((dev) => dev.kind === "audioinput");
      setDevices(mics);
    });
  }, []);

  // -------------------------
  // Create Wavesurfer instance
  // -------------------------
  const initWaveSurfer = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: micRef.current,
      waveColor: "rgb(200,0,200)",
      progressColor: "rgb(100,0,100)",
      height: 120,
    });

    const record = ws.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true,
        continuousWaveform: false,
      })
    );

    // Save refs
    wavesurferRef.current = ws;
    recordRef.current = record;

    // Handle record end
    record.on("record-end", (blob) => {
      const url = URL.createObjectURL(blob);
      setRecordings((prev) => [...prev, { url, blob }]);
    });

    record.on("record-progress", (time) => {
      const mm = String(Math.floor((time % 3600000) / 60000)).padStart(2, "0");
      const ss = String(Math.floor((time % 60000) / 1000)).padStart(2, "0");
      setProgressTime(`${mm}:${ss}`);
    });
  };

  useEffect(() => {
    initWaveSurfer();
  }, []);

  // -------------------------
  // Start Recording
  // -------------------------
  const startRecording = async () => {
    const deviceId = selectedMic || undefined;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });

    await recordRef.current.startRecording(stream);

    setIsRecording(true);
    setIsPaused(false);
  };

  // -------------------------
  // Stop recording
  // -------------------------
  const stopRecording = () => {
    recordRef.current.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setProgressTime("00:00");
  };

  // -------------------------
  // Pause / Resume
  // -------------------------
  const togglePause = () => {
    if (!isRecording) return;

    if (isPaused) {
      recordRef.current.resumeRecording();
      setIsPaused(false);
    } else {
      recordRef.current.pauseRecording();
      setIsPaused(true);
    }
  };

  return (
    <div className="p-4 space-y-4 text-white">

      {/* Device select */}
      <div>
        <label className="block mb-1 font-semibold">Microphone</label>
        <select
          className="bg-gray-800 border border-gray-600 p-2 rounded w-full"
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
        >
          <option value="">Default input</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || d.deviceId}
            </option>
          ))}
        </select>
      </div>

      {/* REC indicator */}
{record.isRecording() && (
  <div className="flex items-center mb-4">
    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.7)]"></div>
    <span className="ml-2 text-red-500 font-semibold tracking-wide">REC</span>
  </div>
)}

      {/* Buttons */}
      <div className="flex gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-green-600 rounded"
          >
            🎙 Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 rounded"
          >
            ⏹ Stop
          </button>
        )}

        {isRecording && (
          <button
            onClick={togglePause}
            className="px-4 py-2 bg-yellow-600 rounded"
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        )}
      </div>

      {/* Time */}
      <div className="text-lg font-bold">{progressTime}</div>

      {/* Waveform */}
      <div
        ref={micRef}
        className="w-full h-[140px] border border-gray-700 rounded"
      />

      {/* Recordings list */}
      <div className="space-y-3">
        {recordings.map((r, index) => (
          <div key={index} className="bg-gray-900 p-3 rounded">
            <audio controls src={r.url} className="w-full" />
            <a
              href={r.url}
              download={`recording-${index}.webm`}
              className="text-blue-400 underline text-sm"
            >
              Download recording
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
