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
  // Load audio (Electron)
  // -------------------------
  const handleLoad = async () => {
    const result = await window.electronAPI.openAudio2();
    if (!result) return;

    addLog("Opening file: " + result.path);

    const audioContext = new AudioContext();
    const decoded = await audioContext.decodeAudioData(result.buffer);
    
    setAudioBuffer(decoded);
    setProcessedBuffer(null);

    setFormatInfo({
      sampleRate: decoded.sampleRate,
      channels: decoded.numberOfChannels,
      duration: decoded.duration.toFixed(2),
      length: decoded.length,
    });

    addLog("Audio loaded.");
    renderWaveforms(decoded, null);
  };

  // -------------------------
  // Run RNNoise
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
      addLog("❌ RNNoise error: " + e.message);
    }

    setLoading(false);
  };

  // -------------------------
  // Export processed buffer
  // -------------------------
  const handleExport = async () => {
    if (!processedBuffer) {
      addLog("Nothing to export.");
      return;
    }

    addLog("Exporting WAV…");

    const wav = audioBufferToWav(processedBuffer);
    const bytes = new Uint8Array(wav);

    const result = await window.electronAPI.saveAudioFile({
      fileName: "processed.wav",
      data: bytes,
    });

    if (result.ok) addLog("Saved → " + result.path);
    else addLog("❌ Save error: " + result.error);
  };

  // -------------------------
  // WAV encoder (CORRECTED)
  // -------------------------
  function audioBufferToWav(abuf) {
    const numCh = abuf.numberOfChannels;
    const sampleRate = abuf.sampleRate;
    const length = abuf.length * numCh * 2 + 44;

    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    let pos = 0;

    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(pos++, s.charCodeAt(i));
      }
    }

    writeString("RIFF");
    view.setUint32(pos, length - 8, true);
    pos += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(pos, 16, true);
    pos += 4;
    view.setUint16(pos, 1, true);
    pos += 2;
    view.setUint16(pos, numCh, true);
    pos += 2;
    view.setUint32(pos, sampleRate, true);
    pos += 4;
    view.setUint32(pos, sampleRate * numCh * 2, true);
    pos += 4;
    view.setUint16(pos, numCh * 2, true);
    pos += 2;
    view.setUint16(pos, 16, true);
    pos += 2;
    writeString("data");
    view.setUint32(pos, abuf.length * numCh * 2, true);
    pos += 4;

    const channels = [];
    for (let ch = 0; ch < numCh; ch++) {
      channels.push(abuf.getChannelData(ch));
    }

    for (let i = 0; i < abuf.length; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        let s = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        pos += 2;
      }
    }

    return buffer;
  }

  // ✅ Helper: AudioBuffer → Blob
  function audioBufferToBlob(audioBuffer) {
    const wav = audioBufferToWav(audioBuffer);
    return new Blob([wav], { type: "audio/wav" });
  }

  // -------------------------
  // Render wavesurfer (CORRECTED)
  // -------------------------
  const renderWaveforms = (before, after) => {
    // Cleanup
    if (beforeWS.current) {
      beforeWS.current.destroy();
      beforeWS.current = null;
    }
    if (afterWS.current) {
      afterWS.current.destroy();
      afterWS.current = null;
    }

    // BEFORE
    beforeWS.current = WaveSurfer.create({
      container: beforeRef.current,
      waveColor: "#999",
      progressColor: "#666",
      height: 120,
    });

    const beforeBlob = audioBufferToBlob(before);
    beforeWS.current.loadBlob(beforeBlob);

    // AFTER
    if (after) {
      afterWS.current = WaveSurfer.create({
        container: afterRef.current,
        waveColor: "#11aaff",
        progressColor: "#0c77aa",
        height: 120,
      });

      const afterBlob = audioBufferToBlob(after);
      afterWS.current.loadBlob(afterBlob);
    } else {
      if (afterRef.current) {
        afterRef.current.innerHTML =
          "<div style='opacity:0.5; padding: 40px; text-align: center; color: #999;'>No processed audio yet</div>";
      }
    }
  };

  return (
    <div className="p-6 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">🎧 Audio Processing</h1>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={handleLoad} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Load Audio
        </button>

        <button
          onClick={handleDenoise}
          disabled={!audioBuffer || loading}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Denoise"}
        </button>

        <button
          onClick={handleExport}
          disabled={!processedBuffer}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export WAV
        </button>
      </div>

      {formatInfo && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <p>Sample rate: {formatInfo.sampleRate} Hz</p>
          <p>Channels: {formatInfo.channels}</p>
          <p>Duration: {formatInfo.duration}s</p>
          <p>Samples: {formatInfo.length}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 font-semibold">Before</h2>
          <div ref={beforeRef} className="h-[140px] bg-gray-900 rounded" />
        </div>

        <div>
          <h2 className="mb-2 font-semibold">After</h2>
          <div ref={afterRef} className="h-[140px] bg-gray-900 rounded" />
        </div>
      </div>

      <div className="mt-6 p-3 bg-black/40 rounded h-40 overflow-auto text-sm font-mono">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}