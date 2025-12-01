import React, { useRef, useState, useEffect } from "react";
import { useWaveSurfer } from "./wavesurfer";
import AudioZoomControls from "./AudioZoomControls";

export default function App() {
  const containerRef = useRef();
  const [file, setFile] = useState(null); // { url, path }
  const [region, setRegion] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  const wave = useWaveSurfer(containerRef, file, setRegion, zoom);

  useEffect(() => {
    console.log("App rendered, current file:", file);
  });

  const selectFile = async () => {
    console.log("Opening audio file...");
    const selected = await window.electronAPI.openAudio();
    console.log("File selected:", selected);
    if (selected) setFile(selected);
  };

  // ✅ Fonction pour supprimer la région sélectionnée
const deleteRegion = async () => {
  if (!region || !wave?.current) {
    console.warn("❌ No region or no Wavesurfer instance");
    return;
  }

  const ws = wave.current;
  const buffer = ws.getDecodedData();

  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(region.start * sampleRate);
  const endSample = Math.floor(region.end * sampleRate);

  // Create new merged channels (audio without removed region)
  const channelCount = buffer.numberOfChannels;
  const mergedChannels = [];

  for (let ch = 0; ch < channelCount; ch++) {
    const data = buffer.getChannelData(ch);

    const before = data.slice(0, startSample);
    const after = data.slice(endSample);

    const merged = new Float32Array(before.length + after.length);
    merged.set(before);
    merged.set(after, before.length);

    mergedChannels.push(merged);
  }

  // Create new AudioBuffer
  const audioContext = new AudioContext();
  const newBuffer = audioContext.createBuffer(
    channelCount,
    mergedChannels[0].length,
    sampleRate
  );

  mergedChannels.forEach((data, ch) => {
    newBuffer.copyToChannel(data, ch);
  });

  // Convert to WAV blob
  const blob = bufferToWave(newBuffer);
  const newUrl = URL.createObjectURL(blob);

  // Reload modified audio in WaveSurfer
  await ws.load(newUrl);

  // Clear region
  region.remove();
  setRegion(null);

  // Update file state so saving works later
  setFile({
    url: newUrl,
    path: file.path   // keep original path
  });

  console.log("✅ Region deleted and audio reloaded.");
};


  // ✅ Sauvegarder le fichier édité
  const saveEditedFile = async () => {
    if (!wave?.current) {
      console.error("❌ No Wavesurfer instance");
      return;
    }

      if (!file?.path) {
    console.error("❌ No file.path provided");
    return;
  }

    console.log("🔍 wave object current:", wave.current);
    console.log("🔍 wave object:", wave);
    const buffer = wave.current.getDecodedData();
    console.log("🔍 decoded buffer:", buffer);
    const blob = bufferToWave(buffer);

  // Extract name from path
  const fileName = file.path.split(/[/\\]/).pop();   // ex: "song.wav"
  const originalName = fileName.replace(/\.\w+$/, ""); // "song"
  const extension = fileName.match(/\.\w+$/)[0];       // ".wav"
    const newName = `${originalName}_remastered${extension}`;
  // Audio processing


    // ✅ Utiliser l'API Electron pour sauvegarder
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Appeler votre IPC handler
    const result = await window.electronAPI.saveAudioFile(newName, uint8Array);

    if (result.ok) {
      alert(`✅ Saved as: ${newName}`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  };

  // ✅ Convertir AudioBuffer en WAV Blob
  const bufferToWave = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++)
        view.setUint8(offset++, str.charCodeAt(i));
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

    // Interleave channels
    const channels = [];
    for (let ch = 0; ch < numOfChan; ch++) {
      channels.push(buffer.getChannelData(ch));
    }

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

  const togglePlay = () => {
    if (!wave?.current) return;
    console.log("Play/pause clicked");
    wave.current.playPause();
    setIsPlaying(wave.current.isPlaying());
  };

  const applyZoom = (z) => {
    console.log("Applying zoom:", z);
    wave.current?.zoom(z);
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="flex gap-2">
      <button className="px-4 py-2 bg-violet-500 text-white rounded disabled:bg-gray-400" onClick={selectFile}>Open audio</button>
      <button className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400" onClick={togglePlay} disabled={!file} style={{ marginLeft: 10 }}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      
        <button
          onClick={deleteRegion}
          disabled={!region}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          Delete Region
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
