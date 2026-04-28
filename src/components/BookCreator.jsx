import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function BookCreator() {
  const initialTemplate = `---
illu_author: 
text_author: 
title: 
type: 
description: ""
status: 
link: 
lecture: 0
timelineStart: 
timelineEnd: 
---

# Titre
`;

  const [code, setCode] = useState(initialTemplate);

  // Listen to transcription-imported events
  useEffect(() => {
    const handler = (e) => {
      const text = e.detail.content;
      setCode((prev) => prev + "\n\n" + text);
    };

    window.addEventListener("transcription-imported", handler);
    return () => window.removeEventListener("transcription-imported", handler);
  }, []);


  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!code.trim()) return;
    setSaving(true);

    try {
      const match = code.match(/link:\s*([^\s]+)/);

      if (!match) {
        alert("❌ Le champ 'link:' est manquant !");
        setSaving(false); // IMPORTANT fix
        return;
      }

      const fileName = match[1].trim().replace(/[^a-zA-Z0-9-_]/g, "");

      const result = await window.electronAPI.createOrUpdateBook(fileName, code);

      if (result.ok) {
        alert(`✅ Saved as ${result.fileName}.md`);
        setCode(initialTemplate);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Error saving book:", err);
      alert("❌ Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 border rounded overflow-hidden shadow-md">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={code}
          onChange={(value) => value !== undefined && setCode(value)}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !code.trim()}
        className={`mt-4 py-2 px-4 rounded text-white font-bold ${
          saving || !code.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {saving ? "Saving..." : "Create / Save"}
      </button>
    </div>
  );
}
