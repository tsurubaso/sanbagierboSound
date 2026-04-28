// src/components/BookEditor.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function BookEditor({ book }) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  const fileName = `${book}.md`;

  useEffect(() => {
    const load = async () => {
      try {
        const txt = await window.electronAPI.readMarkdownEditing(book);
        setContent(txt);
        setStatus("ready");
      } catch (e) {
        console.error("Failed to load markdown:", e);
        setStatus("error");
      }
    };

    load();
  }, [book]);

  const saveFile = async () => {
    try {
      await window.electronAPI.writeMarkdown(book, content);
      alert("Saved!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save file.");
    }
  };

  const deleteFile = async () => {
    if (!window.confirm(`⚠️ Are you sure you want to delete ${fileName}?`))
      return;

    try {
      await window.electronAPI.eraseMarkdown(book); // nouvelle API côté main.js
    

      alert(`✅ ${fileName} deleted.`);
      navigate("/"); // retour à la home
      // Lancer le rescan sans bloquer
    window.electronAPI.rescanBooks().catch(err => console.error("Rescan failed:", err));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Failed to delete file.");
    }
  };

  if (status === "loading") return <p className="p-4">Loading…</p>;
  if (status === "error")
    return <p className="p-4 text-red-400">File not found.</p>;

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-[#1e1e1e] text-gray-200 border-b border-gray-600 flex justify-between items-center">
        <div className="font-semibold">{fileName}</div>
        <div className="flex gap-2">
          <button
            onClick={saveFile}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded"
          >
            Save
          </button>
          <button
            onClick={deleteFile}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={content}
          onChange={(v) => setContent(v ?? "")}
          options={{
            wordWrap: "on",
            minimap: { enabled: false },
            fontSize: 16,
            padding: { top: 16 },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
