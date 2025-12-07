import React, { useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

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

  //clean
  async function cleanAudio(audioBuffer, options = {}) {
    const {
      highPassFreq = 80, // Couper en dessous de 80Hz
      lowPassFreq = 15000, // Couper au-dessus de 15kHz
      gateThreshold = -45, // Noise gate en dB
    } = options;

    const ctx = new AudioContext();
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

    // Source
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // High-pass filter (enlève bruit grave)
    const highPass = offlineCtx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = highPassFreq;
    highPass.Q.value = 0.7;

    // Low-pass filter (enlève bruit aigu)
    const lowPass = offlineCtx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = lowPassFreq;
    lowPass.Q.value = 0.7;

    // Dynamics compressor (égalise le son)
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Chain: source → highPass → lowPass → compressor → destination
    source.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(compressor);
    compressor.connect(offlineCtx.destination);

    source.start();

    return await offlineCtx.startRendering();
  }
  //normalisation

  function normalizeAudioBuffer(buffer) {
    const numCh = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    // Trouver le peak absolu
    let peak = 0;
    for (let ch = 0; ch < numCh; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        peak = Math.max(peak, Math.abs(data[i]));
      }
    }

    if (peak === 0) return buffer; // silence

    // Facteur de normalisation (target peak = 0.99)
    const gain = 0.99 / peak;

    // Nouveau buffer
    const ctx = new AudioContext();
    const newBuffer = ctx.createBuffer(numCh, length, sampleRate);

    for (let ch = 0; ch < numCh; ch++) {
      const input = buffer.getChannelData(ch);
      const output = newBuffer.getChannelData(ch);

      for (let i = 0; i < input.length; i++) {
        output[i] = input[i] * gain;
      }
    }

    return newBuffer;
  }

  function compressAudioBuffer(audioBuffer, opts = {}) {
    const {
      threshold = -20, // dB
      ratio = 4,
      attack = 0.01, // seconds
      release = 0.1, // seconds
    } = opts;

    const input = audioBuffer.getChannelData(0);

    const sampleRate = audioBuffer.sampleRate;
    const out = new Float32Array(input.length);

    let gain = 1.0;
    const attackCoeff = Math.exp(-1 / (sampleRate * attack));
    const releaseCoeff = Math.exp(-1 / (sampleRate * release));

    for (let i = 0; i < input.length; i++) {
      const x = input[i];
      const level = Math.abs(x);

      // Convert threshold to linear amplitude
      const thresholdLin = Math.pow(10, threshold / 20);

      let targetGain = 1.0;

      if (level > thresholdLin) {
        const dbAbove = 20 * Math.log10(level / thresholdLin);
        const compressedDb = dbAbove / ratio;
        const gainDb = compressedDb - dbAbove;
        targetGain = Math.pow(10, gainDb / 20);
      }

      // Smooth gain
      if (targetGain < gain)
        gain = attackCoeff * (gain - targetGain) + targetGain;
      else gain = releaseCoeff * (gain - targetGain) + targetGain;

      out[i] = x * gain;
    }

    const outputBuffer = new AudioBuffer({
      length: out.length,
      sampleRate,
    });

    outputBuffer.copyToChannel(out, 0);

    return outputBuffer;
  }

  async function equalizeAudioBuffer(audioBuffer, opts = {}) {
    const { lowGain = 0, midGain = 0, highGain = 0 } = opts;

    const ctx = new OfflineAudioContext(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const low = ctx.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 200;
    low.gain.value = lowGain;

    const mid = ctx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 1; // ✅ FIX : use .value
    mid.gain.value = midGain;

    const high = ctx.createBiquadFilter();
    high.type = "highshelf";
    high.frequency.value = 4000;
    high.gain.value = highGain;

    source.connect(low).connect(mid).connect(high).connect(ctx.destination);
    source.start();

    return await ctx.startRendering();
  }

  async function removeSilenceSmart(audioBuffer, options = {}) {
    const {
      silenceThreshold = -50, // en dB
      minSilenceDuration = 0.5, // 500ms = silence considéré trop long
      prePadding = 0.15, // 150ms avant parole
      postPadding = 0.2, // 200ms après parole
      analysisWindow = 0.02, // 20ms fenêtre d’analyse
    } = options;

    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * analysisWindow);

    const numChannels = audioBuffer.numberOfChannels;
    const channels = [];

    for (let ch = 0; ch < numChannels; ch++) {
      channels.push(audioBuffer.getChannelData(ch));
    }

    // Helper RMS
    const rms = (arr, start, size) => {
      let sum = 0;
      for (let i = start; i < start + size; i++) {
        const v = arr[i] || 0;
        sum += v * v;
      }
      return Math.sqrt(sum / size);
    };

    const silenceThresholdLinear = Math.pow(10, silenceThreshold / 20);

    const speakingRegions = [];
    let currentStart = null;

    // Scan
    for (let i = 0; i < audioBuffer.length - windowSize; i += windowSize) {
      const windowRMS = rms(channels[0], i, windowSize);

      const isSpeech = windowRMS > silenceThresholdLinear;

      if (isSpeech && currentStart === null) {
        currentStart = i;
      } else if (!isSpeech && currentStart !== null) {
        const regionLength = i - currentStart;
        if (regionLength / sampleRate > minSilenceDuration) {
          speakingRegions.push({ start: currentStart, end: i });
        }
        currentStart = null;
      }
    }

    // Nothing detected? Return original
    if (speakingRegions.length === 0) return audioBuffer;

    // Merge too-close regions
    const merged = [];
    let prev = speakingRegions[0];

    for (let i = 1; i < speakingRegions.length; i++) {
      const cur = speakingRegions[i];
      if (cur.start - prev.end < sampleRate * 0.15) {
        prev.end = cur.end;
      } else {
        merged.push(prev);
        prev = cur;
      }
    }
    merged.push(prev);

    // Add paddings
    const padded = merged.map((r) => ({
      start: Math.max(0, r.start - prePadding * sampleRate),
      end: Math.min(audioBuffer.length, r.end + postPadding * sampleRate),
    }));

    // Compute output length
    let totalSamples = 0;
    for (const r of padded) totalSamples += r.end - r.start;

    const offline = new OfflineAudioContext(
      numChannels,
      totalSamples,
      sampleRate
    );
    const output = offline.createBuffer(numChannels, totalSamples, sampleRate);

    // Fill output buffer
    let writeIndex = 0;

    padded.forEach((region) => {
      const regionLength = region.end - region.start;

      for (let ch = 0; ch < numChannels; ch++) {
        const out = output.getChannelData(ch);
        const src = channels[ch];
        out.set(src.subarray(region.start, region.end), writeIndex);
      }

      writeIndex += regionLength;
    });

    return output;
  }

  //add log
  const addLog = (msg) =>
    setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleCompress = async () => {
    if (!audioBuffer) return addLog("Load an audio first");

    addLog("Applying compression…");

    const buf = compressAudioBuffer(audioBuffer, {
      threshold: -18,
      ratio: 3,
      attack: 0.01,
      release: 0.1,
    });

    setProcessedBuffer(buf);
    addLog("Compression done.");
  };

  const handleEQ = async () => {
    if (!audioBuffer) return addLog("Load an audio first");

    addLog("Applying EQ…");

    const buf = await equalizeAudioBuffer(audioBuffer, {
      lowGain: +3,
      midGain: +1,
      highGain: +4,
    });

    setProcessedBuffer(buf);
    addLog("EQ done.");
  };

  const handleRemoveSilence = async () => {
    if (!audioBuffer) return;

    setLoading(true);
    addLog("Removing silence…");

    try {
      const cleaned = await removeSilenceSmart(audioBuffer);
      setProcessedBuffer(cleaned);
      renderWaveforms(audioBuffer, cleaned);
      addLog("Silence removed.");
    } catch (e) {
      addLog("❌ Silence removal error: " + e.message);
    }

    setLoading(false);
  };

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
  // Normalize Audio
  // -------------------------

  const handleNormalize = async () => {
    if (!audioBuffer) return;

    addLog("Normalizing audio…");

    const normalized = normalizeAudioBuffer(audioBuffer);

    setProcessedBuffer(normalized);
    renderWaveforms(audioBuffer, normalized);

    addLog("Normalization complete.");
  };

  // -------------------------
  // Clean Audio (remplace denoiseAudioBuffer)
  // -------------------------
  const handleClean = async () => {
    if (!audioBuffer) return;

    setLoading(true);
    addLog("Cleaning audio…");

    try {
      const cleaned = await cleanAudio(audioBuffer, {
        highPassFreq: 80,
        lowPassFreq: 15000,
        gateThreshold: -45,
      });

      setProcessedBuffer(cleaned);
      addLog("Audio cleaned.");
      renderWaveforms(audioBuffer, cleaned);
    } catch (e) {
      addLog("❌ Clean error: " + e.message);
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

    // ✅ Nettoyer le HTML aussi
    if (beforeRef.current) beforeRef.current.innerHTML = "";
    if (afterRef.current) afterRef.current.innerHTML = "";

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
      // ✅ Message uniquement si pas de "after"
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
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Load Audio
        </button>

        <button
          onClick={handleClean}
          disabled={!audioBuffer || loading}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Clean Audio"}
        </button>
        <button
          onClick={handleNormalize}
          disabled={!audioBuffer}
          className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700 disabled:opacity-50"
        >
          Normalize
        </button>
        <button
          onClick={handleCompress}
          disabled={!audioBuffer}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Compress
        </button>
        <button
          onClick={handleEQ}
          disabled={!audioBuffer}
          className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          EQ
        </button>

        <button
          onClick={handleRemoveSilence}
          disabled={!audioBuffer || loading}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Remove Silence"}
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
        {/* BEFORE */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Before</h2>
            <button
              onClick={() => beforeWS.current?.playPause()}
              disabled={!audioBuffer}
              className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              ▶️ Play/Pause
            </button>
          </div>
          <div ref={beforeRef} className="h-[140px] bg-gray-900 rounded" />
        </div>

        {/* AFTER */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">After</h2>
            <button
              onClick={() => afterWS.current?.playPause()}
              disabled={!processedBuffer}
              className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              ▶️ Play/Pause
            </button>
          </div>
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
