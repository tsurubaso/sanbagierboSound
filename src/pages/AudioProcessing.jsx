import React, { useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { denoiseAudioBuffer } from "../audio/processors/rnnoise";

export default function AudioProcessingPage() {
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  const beforeWS = useRef(null);
  const afterWS = useRef(null);

  const [audioBuffer, setAudioBuffer] = useState(null);
  const [processedBuffer, setProcessedBuffer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formatInfo, setFormatInfo] = useState(null);

  const addLog = (msg) =>
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // -------------------------
  // LOAD AUDIO FROM ELECTRON
  // -------------------------
  const handleLoad = async () => {
    const result = await window.api.openAudioDialog();
    if (!result) return;

    const arrayBuffer = result.buffer;

    const audioContext = new AudioContext();
    const decoded = await audioContext.decodeAudioData(arrayBuffer);

    setAudioBuffer(decoded);
    setProcessedBuffer(null);

    setFormatInfo({
      sampleRate: decoded.sampleRate,
      channels: decoded.numberOfChannels,
      length: decoded.length,
      duration: decoded.duration.toFixed(2),
    });

    addLog("Audio loaded.");
    renderWaveforms(decoded, null);
  };

  // -------------------------
  // DENOISE
  // -------------------------
  const handleDenoise = async () => {
    if (!audioBuffer) return;

    setLoading(true);
    addLog("Running RNNoise…");

    try {
      const cleaned = await denoiseAudioBuffer(audioBuffer);
      setProcessedBuffer(cleaned);
      addLog("Denoise complete.");
      renderWaveforms(audioBuffer, cleaned);
    } catch (e) {
      addLog("❌ ERROR: " + e.message);
    }

    setLoading(false);
  };

  // -------------------------
  // EXPORT AFTER
  // -------------------------
  const handleExport = async () => {
    if (!processedBuffer) {
      addLog("Nothing to export.");
      return;
    }

    addLog("Exporting WAV…");

    const wavData = audioBufferToWav(processedBuffer);
    const uint8 = new Uint8Array(wavData);

    const result = await window.api.saveAudioFile({
      fileName: "processed.wav",
      data: uint8,
    });

    if (result.ok) addLog("Saved → " + result.path);
    else addLog("❌ Save error: " + result.error);
  };

  // -------------------------
  // WAV ENCODER (simple)
  // -------------------------
  function audioBufferToWav(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const len = abuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    let channels = [];
    let sample = abuffer.getChannelData(0);
    let pos = 0;

    // Write headers
    function writeString(str) {
      for (let i = 0; i < str.length; i++) view.setUint8(pos++, str.charCodeAt(i));
    }

    writeString("RIFF");
    view.setUint32(pos, 36 + len, true); pos += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numOfChan, true); pos += 2;
    view.setUint32(pos, abuffer.sampleRate, true); pos += 4;
    view.setUint32(pos, abuffer.sampleRate * numOfChan * 2, true); pos += 4;
    view.setUint16(pos, numOfChan * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    writeString("data");
    view.setUint32(pos, len, true); pos += 4;

    let offset = 44;
    for (let i = 0; i < sample.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, sample[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }

  // -------------------------
  // Wavesurfer Rendering
  // -------------------------
  const renderWaveforms = (before, after) => {
    beforeWS.current?.destroy();
    afterWS.current?.destroy();

    beforeWS.current = WaveSurfer.create({
      container: beforeRef.current,
      waveColor: "#666",
      progressColor: "#333",
      height: 120,
    });
    beforeWS.current.loadDecodedBuffer(before);

    if (after) {
      afterWS.current = WaveSurfer.create({
        container: afterRef.current,
        waveColor: "#11aaff",
        progressColor: "#0c77aa",
        height: 120,
      });
      afterWS.current.loadDecodedBuffer(after);
    } else {
      afterRef.current.innerHTML = "<p style='opacity:0.5'>No processed audio yet</p>";
    }
  };

  return (
    <div className="p-6 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">🎧 Audio Processing</h1>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={handleLoad} className="px-4 py-2 bg-blue-600 rounded">
          Load Audio
        </button>

        <button
          onClick={handleDenoise}
          disabled={!audioBuffer || loading}
          className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50"
        >
          Denoise (RNNoise)
        </button>

        <button
          onClick={handleExport}
          disabled={!processedBuffer}
          className="px-4 py-2 bg-green-600 rounded disabled:opacity-50"
        >
          Export WAV
        </button>
      </div>

      {/* Format info */}
      {formatInfo && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h2 className="font-semibold">Format</h2>
          <p>Sample rate: {formatInfo.sampleRate}</p>
          <p>Channels: {formatInfo.channels}</p>
          <p>Duration: {formatInfo.duration}s</p>
        </div>
      )}

      {/* Before / After */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Before</h2>
          <div ref={beforeRef} className="h-[140px] bg-gray-900 rounded" />
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">After</h2>
          <div ref={afterRef} className="h-[140px] bg-gray-900 rounded" />
        </div>
      </div>

      {/* Logs */}
      <div className="mt-6 p-3 bg-black/40 rounded h-40 overflow-auto text-sm font-mono">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
