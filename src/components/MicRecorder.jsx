import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export default function MicRecorder() {
  const micRef = useRef(null);
  const wavesurferRef = useRef(null);
  const recordRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [progressTime, setProgressTime] = useState("00:00");

  // ----------------------------------------------------
  // Load audio devices
  // ----------------------------------------------------
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((d) => {
      const mics = d.filter((dev) => dev.kind === "audioinput");
      setDevices(mics);
    });
  }, []);

  // ----------------------------------------------------
  // Initialize Wavesurfer + Recorder
  // ----------------------------------------------------
  const initWaveSurfer = () => {
    if (wavesurferRef.current) wavesurferRef.current.destroy();

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
      }),
    );

    wavesurferRef.current = ws;
    recordRef.current = record;

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

  // ----------------------------------------------------
  // Ajout recent de l'IA
  // ----------------------------------------------------

  useEffect(() => {
    initWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  /*

// Alternative : ce qu'il y avait avant.
  useEffect(() => {
    initWaveSurfer();
  }, []);
*/

  // ----------------------------------------------------
  // Start Recording
  // ----------------------------------------------------
  const startRecording = async () => {
    const deviceId = selectedMic || undefined;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });

    await recordRef.current.startRecording(stream);
    setIsRecording(true);
    setIsPaused(false);
  };

  // ----------------------------------------------------
  // Stop Recording
  // ----------------------------------------------------
  const stopRecording = () => {
    recordRef.current.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setProgressTime("00:00");
  };

  // ----------------------------------------------------
  // Pause / Resume
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // LOAD AUDIO (AUTOMATIC - DRAG & DROP)
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    const handleDrop = (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        ws.load(URL.createObjectURL(file));
      }
    };

    wsRef.current
      .getWrapper()
      .addEventListener("dragover", (e) => e.preventDefault());
    wsRef.current.getWrapper().addEventListener("drop", handleDrop);

    ws.registerPlugin({
      name: "customCursor",
      params: {
        color: "#ff66cc",
      },
      instance: {
        init() {
          const cursor = document.createElement("div");
          cursor.style.position = "absolute";
          cursor.style.top = "0";
          cursor.style.width = "2px";
          cursor.style.height = "100%";
          cursor.style.backgroundColor = this.params.color;
          cursor.style.pointerEvents = "none";
          this.cursor = cursor;
          this.wrapper.appendChild(cursor);
        },
      },
    });

    return () => {
      if (ws) {
        ws.getWrapper().removeEventListener("dragover", (e) =>
          e.preventDefault(),
        );
        ws.getWrapper().removeEventListener("drop", handleDrop);
      }
    };
  }, []);

  const handleExportWav = async (blob, index) => {
    try {
      // 1. Préparation du nom de fichier (Format: recording_1_2026-05-07_1430.wav)
      const date = new Date().toISOString().split("T")[0];
      const time = new Date()
        .toLocaleTimeString("fr-FR")
        .replace(/:/g, "")
        .split(" ")[0]
        .slice(0, 4);

      const newName = `recording_${index + 1}_${date}_${time}.wav`;

      // 2. Conversion Blob -> AudioBuffer
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      await audioCtx.close(); // Libère les ressources matérielles audio//////////////////////////////



      // 3. Conversion AudioBuffer -> WAV (via ta fonction utilitaire)
      const wavArrayBuffer = audioBufferToWav(audioBuffer);
      const bytes = new Uint8Array(wavArrayBuffer);

      // 4. Appel à Electron (Vérifie bien si c'est electronAPI ou electron dans ton preload)
      const result = await window.electronAPI.saveAudioFile({
        fileName: newName,
        data: bytes,
      });

      if (result.ok) {
        console.log("Succès !", result.path);
      }
    } catch (err) {
      console.error("Erreur lors de l'export WAV :", err);
      alert(
        "Erreur de communication avec Electron. Vérifie window.electronAPI dans ton preload.",
      );
    }
  };

  // --- Utility: AudioBuffer to WAV ---
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const bufferLength = buffer.length;
    const dataSize = bufferLength * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    /* RIFF identifier */
    writeString(0, "RIFF");
    /* file length */
    view.setUint32(4, totalSize - 8, true);
    /* RIFF type */
    writeString(8, "WAVE");
    /* format chunk identifier */
    writeString(12, "fmt ");
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(36, "data");
    /* data chunk length */
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    const offset = 44;
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    let index = 0;
    for (let i = 0; i < bufferLength; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = channelData[ch][i];
        // Clamp sample to [-1, 1]
        sample = Math.max(-1, Math.min(1, sample));
        // Convert to 16-bit PCM
        view.setInt16(
          offset + index,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        index += 2;
      }
    }

    return arrayBuffer;
  }

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

      {/* REC Indicator */}
      {recordRef.current?.isRecording() && (
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.7)]"></div>
          <span className="ml-2 text-red-500 font-semibold tracking-wide">
            REC
          </span>
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
          <div
            key={index}
            className="bg-gray-900 p-3 rounded flex flex-col gap-2"
          >
            <audio controls src={r.url} className="w-full" />

            <div className="flex justify-between items-center">
              {/* Ton lien existant pour le téléchargement WebM direct */}
              <a
                href={r.url}
                download={`recording-${index}.webm`}
                className="text-blue-400 underline text-sm"
              >
                Download (WebM)
              </a>

              {/* Nouveau bouton pour l'export WAV via Electron */}
              <button
                onClick={() => handleExportWav(r.blob, index)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded transition-colors"
              >
                💾 Save as WAV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
