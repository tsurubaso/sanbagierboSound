import React from "react";

export default function ImportTranscriptionButton() {
  const handleImport = async () => {
    const filePath = await window.electronAPI.selectTranscriptionFile();
    if (!filePath) return;

    const result = await window.electronAPI.readFile(filePath);
    if (!result.ok) {
      alert("Erreur de lecture : " + result.error);
      return;
    }

    // 🔥 Émettre un événement custom
    window.dispatchEvent(
      new CustomEvent("transcription-imported", {
        detail: {
          content: result.content,
          filePath: filePath,
        },
      })
    );
  };

  return (
    <button
      onClick={handleImport}
      className="mt-4 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
    >
      📥 Importer transcription
    </button>
  );
}
