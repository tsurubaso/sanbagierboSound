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
  const [saving, setSaving] = useState(false);

  // Écoute les imports de transcription (ton workflow Python/Ollama)
  useEffect(() => {
    const handler = (e) => {
      const text = e.detail.content;
      setCode((prev) => prev + "\n\n" + text);
    };

    window.addEventListener("transcription-imported", handler);
    return () => window.removeEventListener("transcription-imported", handler);
  }, []);

  const handleSave = async () => {
    if (!code.trim()) return;
    setSaving(true);

    try {
      // 1. Extraction du 'link' pour définir le nom du fichier
      const match = code.match(/link:\s*([^\s]+)/);
      if (!match || !match[1].trim()) {
        alert(
          "❌ Le champ 'link:' est obligatoire dans le frontmatter pour nommer le fichier !",
        );
        setSaving(false);
        return;
      }

      // Nettoyage du nom de fichier (on garde l'extension .md pour Forgejo)
      const rawLink = match[1].trim();
      const fileName = `${rawLink.replace(/[^a-zA-Z0-9-_]/g, "")}.md`;

      // 2. Envoi au Main via le handler universel
      // On passe l'objet attendu par ton nouveau ipcMain.handle("write-markdown")
      const result = await window.electronAPI.writeMarkdownCreate({
        fileName: fileName,
        content: code,
        branch: "main",
      });

      if (result.ok) {
        alert(`✅ Succès ! Fichier traité : ${fileName}`);
        // Optionnel : reset l'éditeur seulement si c'est une création pure
        // setCode(initialTemplate);
      } else {
        alert(`❌ Erreur Forgejo : ${result.error}`);
      }
    } catch (err) {
      console.error("Error saving book:", err);
      alert("❌ Erreur critique lors de l'envoi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-[#121212]">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Nouveau Livre / Fiche</h1>
        <span className="text-xs text-gray-400 font-mono">
          Mode: write-markdown (Upsert)
        </span>
      </div>

      <div className="flex-1 border border-gray-700 rounded overflow-hidden shadow-2xl">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={code}
          onChange={(value) => value !== undefined && setCode(value)}
          theme="vs-dark" // On passe en dark pour matcher ton setup Forgejo/Vite
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            wordWrap: "on",
            padding: { top: 20 },
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !code.trim()}
        className={`mt-4 py-3 px-6 rounded-lg text-white font-bold transition-all shadow-lg ${
          saving || !code.trim()
            ? "bg-gray-600 cursor-not-allowed opacity-50"
            : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
        }`}
      >
        {saving
          ? "Communication avec Forgejo..."
          : "🚀 Créer ou Mettre à jour sur Main"}
      </button>
    </div>
  );
}
