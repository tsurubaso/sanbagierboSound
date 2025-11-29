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
    if (!region || !waveRef.current) return;

    const ws = waveRef.current;
    const buffer = ws.getDecodedData();

    // Créer un nouveau buffer sans la région
    const audioContext = new AudioContext();
    const sampleRate = buffer.sampleRate;
    const startSample = Math.floor(region.start * sampleRate);
    const endSample = Math.floor(region.end * sampleRate);

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

    channels.forEach((data, ch) => {
      newBuffer.copyToChannel(data, ch);
    });

    // Convertir en WAV blob
    const blob = bufferToWave(newBuffer);

    // Recharger dans WaveSurfer
    await ws.load(URL.createObjectURL(blob));

    region.remove();
    setRegion(null);
  };

  // ✅ Sauvegarder le fichier édité
  const saveEditedFile = async () => {
    if (!waveRef.current) return;

    const buffer = waveRef.current.getDecodedData();
    const blob = bufferToWave(buffer);

    // Créer un nom avec suffix
    const originalName = file.name.replace(/\.\w+$/, "");
    const extension = file.name.match(/\.\w+$/)[0];
    const newName = `${originalName}_remastered${extension}`;

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
      <button onClick={selectFile}>Open audio</button>
      <button onClick={deleteRegion} disabled={!region}>
        Delete selection
      </button>
      <button onClick={togglePlay} disabled={!file} style={{ marginLeft: 10 }}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <div className="flex gap-2">
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
