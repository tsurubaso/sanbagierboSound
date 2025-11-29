import React, { useRef, useState } from "react";
import { useWaveSurfer } from "./wavesurfer";

export default function App() {
  const containerRef = useRef();
  const [file, setFile] = useState(null); // {url, path}
  const [region, setRegion] = useState(null);

  console.log("App rendered, current file:", file);

  const wave = useWaveSurfer(containerRef, file?.url, setRegion);

  const selectFile = async () => {
    console.log("Opening audio file...");
    const selected = await window.electronAPI.openAudio();
    console.log("File selected:", selected);
    if (selected) setFile(selected);
  };

  const deleteRegion = async () => {
    console.log("Deleting region:", region);
    if (!file || !region) return;

    const outputPath = await window.electronAPI.deleteRegion({
      file: file.path,
      start: region.start,
      end: region.end
    });
    console.log("Region deleted, new file path:", outputPath);

    // Optional: open the edited file and reload in Wavesurfer
    const newFile = await window.electronAPI.openEditedFile(outputPath);
    console.log("Edited file loaded:", newFile);
    setFile(newFile);
    setRegion(null);
  };

  return (
    <div className="p-6">
      <button
        onClick={selectFile}
        className="px-4 py-2 bg-blue-600 rounded-md text-white"
      >
        Open Audio
      </button>

      <button
        onClick={deleteRegion}
        disabled={!region}
        className={`px-4 py-2 rounded-md font-medium ml-2 ${
          region ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        Delete Selection
      </button>

      <div
        ref={containerRef}
        className="mt-6 w-full h-48 bg-gray-800 rounded-md border border-gray-700"
      />
    </div>
  );
}
