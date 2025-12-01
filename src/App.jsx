import React, { useRef, useState, useEffect } from "react";
import { useWaveSurfer } from "./wavesurfer";
import AudioZoomControls from "./AudioZoomControls";

export default function App() {
  const containerRef = useRef();
  const [file, setFile] = useState(null); // { url, path }
  const [region, setRegion] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  // NEW: automatic region parameters
  const [start, setStart] = useState(0);
  const DURATION_SEC = 2; // region length
  const STEP = 300;       // 5 min = 300 seconds

  const wave = useWaveSurfer(containerRef, file, setRegion, zoom);

  useEffect(() => {
    console.log("App rendered, file:", file);
  });

  // ===========================================================================
  // Auto-create or update the single region when start changes
  // ===========================================================================
  useEffect(() => {
    if (!wave?.current || !file) return;

    const ws = wave.current;
    const regionsPlugin = ws.plugins?.find(
      (p) => p.constructor.name === "RegionsPlugin"
    );
    if (!regionsPlugin) {
      console.warn("Regions plugin not ready yet");
      return;
    }

    const end = Math.min(ws.getDuration() || Infinity, start + DURATION_SEC);

    // If region exists → update it
    if (region) {
      console.log("Updating region:", start, end);
      try {
        region.update({ start, end });
      } catch (err) {
        console.error("Region update failed:", err);
      }
      return;
    }

    // If no region → create one
    console.log("Creating auto region:", start, end);
    const newRegion = regionsPlugin.addRegion({
      start,
      end,
      color: "rgba(255,0,0,0.3)",
      drag: true,
      resize: true,
    });

    newRegion.on("click", () => setRegion(newRegion));
    setRegion(newRegion);
  }, [start, file, wave]);

  // ===========================================================================
  // BUTTON HELPERS
  // ===========================================================================
  const bumpStart = (delta) => {
    if (!wave?.current) return;
    const duration = wave.current.getDuration() || 0;

    let next = start + delta;
    if (next < 0) next = 0;
    if (next > duration - 1) next = Math.max(0, duration - DURATION_SEC);

    setStart(next);
  };

  const createRegion = () => {
    // simply re-trigger effect
    setRegion(null);
    setStart(start);
  };

  // ===========================================================================
  // FILE SELECT
  // ===========================================================================
  const selectFile = async () => {
    const selected = await window.electronAPI.openAudio();
    if (selected) setFile(selected);
  };

  // ===========================================================================
  // DELETE REGION + CUT AUDIO
  // ===========================================================================
  const deleteRegion = async () => {
    if (!region || !wave.current || !file) return;

    const ws = wave.current;
    const buffer = ws.getDecodedData();

    const audioContext = new AudioContext();
    const sampleRate = buffer.sampleRate;

    const startSample = Math.floor(region.start * sampleRate);
    const endSample = Math.floor(region.end * sampleRate);

    // Rebuild buffer without region
    const channels = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      const before = data.slice(0, startSample);
      const after = data.slice(endSample);

      const merged = new Float32Array(before.length + after.length);
      merged.set(before);
      merged.set(after, before.length);

      channels.push(merged);
    }

    const newBuffer = audioContext.createBuffer(
      buffer.numberOfChannels,
      channels[0].length,
      sampleRate
    );

    channels.forEach((data, ch) => newBuffer.copyToChannel(data, ch));

    const blob = bufferToWave(newBuffer);
    const newUrl = URL.createObjectURL(blob);

    region.remove();
    setRegion(null);

    if (file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);

    setFile({ url: newUrl, path: file.path });
    console.log("Region deleted & audio rebuilt");
  };

  // ===========================================================================
  // SAVE
  // ===========================================================================
  const saveEditedFile = async () => {
    if (!wave?.current || !file?.path) return;

    const buffer = wave.current.getDecodedData();
    const blob = bufferToWave(buffer);

    const fileName = file.path.split(/[/\\]/).pop();
    const base = fileName.replace(/\.\w+$/, "");
    const ext = fileName.match(/\.\w+$/)[0];

    const newName = `${base}_remastered${ext}`;
    const arrayBuffer = await blob.arrayBuffer();

    const result = await window.electronAPI.saveAudioFile(
      newName,
      new Uint8Array(arrayBuffer)
    );

    if (result.ok) alert("Saved: " + newName);
    else alert("Error: " + result.error);
  };

  // ===========================================================================
  // AUDIO BUFFER → WAV
  // ===========================================================================
  const bufferToWave = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    const writeString = (s) => {
      for (let i = 0; i < s.length; i++)
        view.setUint8(offset++, s.charCodeAt(i));
    };

    writeString("RIFF");
    view.setUint32(offset, length - 8, true);
    offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, buffer.sampleRate, true);
    offset += 4;
    view.setUint32(offset, buffer.sampleRate * 2 * numOfChan, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString("data");
    view.setUint32(offset, length - offset - 4, true);
    offset += 4;

    const channels = [];
    for (let ch = 0; ch < numOfChan; ch++)
      channels.push(buffer.getChannelData(ch));

    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  };

  // ===========================================================================
  // PLAY / ZOOM
  // ===========================================================================
  const togglePlay = () => {
    if (!wave?.current) return;
    wave.current.playPause();
    setIsPlaying(wave.current.isPlaying());
  };

  const applyZoom = (z) => wave.current?.zoom(z);

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <div style={{ padding: 20 }}>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-violet-500 text-white rounded" onClick={selectFile}>
          Open audio
        </button>

        <button
          className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400"
          onClick={togglePlay}
          disabled={!file}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={deleteRegion}
          disabled={!region}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Delete Region
        </button>

        {/* region movement */}
        <button onClick={() => bumpStart(-STEP)} className="px-2 py-1 bg-gray-200 rounded">
          -5min
        </button>
        <button onClick={() => bumpStart(-10)} className="px-2 py-1 bg-gray-200 rounded">
          -10s
        </button>
        <button onClick={() => bumpStart(10)} className="px-2 py-1 bg-gray-200 rounded">
          +10s
        </button>
        <button onClick={() => bumpStart(STEP)} className="px-2 py-1 bg-gray-200 rounded">
          +5min
        </button>

        <button
          onClick={createRegion}
          disabled={!!region || !file}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Create Region
        </button>

        <button
          onClick={saveEditedFile}
          disabled={!file}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          💾 Save as Remastered
        </button>
      </div>

      <AudioZoomControls zoom={zoom} setZoom={setZoom} onChange={applyZoom} />

      <div
        ref={containerRef}
        style={{
          marginTop: 20,
          width: "100%",
          height: 200,
          border: "1px solid #aaa",
        }}
      />
    </div>
  );
}
