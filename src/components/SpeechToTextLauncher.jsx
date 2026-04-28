import React from "react";

export default function SpeechToTextLauncher() {
const runSpeechToText = async () => {
  const filePaths = await window.electronAPI.showOpenDialog({
    filters: [
      { name: "Audio", extensions: ["wav", "mp3", "m4a", "ogg", "flac"] },
    ],
    properties: ["openFile"],
  });

  if (!filePaths || filePaths.length === 0) return;

  const config = {
    input_path: filePaths[0],
    language: "fr-FR",
    // PAS d’output ici → Electron s’en occupe
  };

window.electronAPI.runPythonSTT(config);
};

  return (
    <div className="p-3 flex flex-col items-center">
      <button
        onClick={runSpeechToText}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
      >
        🎤 Transcrire un audio
      </button>
    </div>
  );
}
