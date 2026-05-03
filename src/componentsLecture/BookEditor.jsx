// src/components/BookEditor.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getBooksData } from "@/services/getBooksData.jsx";

export default function BookEditor() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("loading");
  const [fileName, setFileName] = useState("");
  const [book, setBook] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isRawMode, setIsRawMode] = useState(false);
  const navigate = useNavigate();
  const { link } = useParams();

  // 1. Charger les métadonnées et la liste des branches au montage
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const data = await getBooksData();
        const found = data.find((b) => b.link === link);

        if (!found) {
          console.error("❌ Book not found:", link);
          setStatus("error");
          return;
        }

        setBook(found);
        setFileName(found.name);

        // Récupérer les branches disponibles
        const branchList = await window.electronAPI.getAllBranches();
        setBranches(branchList);
      } catch (err) {
        console.error("❌ loadMeta failed:", err);
        setStatus("error");
      }
    };

    loadMeta();
  }, [link]);

  // 2. Charger le contenu dès que le livre ou la branche change
  useEffect(() => {
    if (!book) return;

    const fetchContent = async () => {
      setStatus("loading");
      try {
        // Remplacement dynamique de la branche dans l'URL
        const dynamicUrl = book.url.replace(
          /\/branch\/[^/]+/,
          `/branch/${selectedBranch}`,
        );

        console.log(`📡 Fetching [${selectedBranch}]: ${dynamicUrl}`);

        const rawContent = await window.electronAPI.readMarkdown({
          url: `${dynamicUrl}?t=${Date.now()}`,
          raw: isRawMode, // On passe l'état ici 🔥
        });

        setContent(rawContent);
        setStatus("ready");
      } catch (err) {
        if (err.message.includes("404")) {
          setContent(""); // fichier absent dans cette branche
        }
      }
    };

    fetchContent();
  }, [book, selectedBranch]);

  const saveFile = async () => {
    if (!book) return;
    try {
      const result = await window.electronAPI.writeMarkdownCreate({
        fileName: book.name,
        content,
        branch: selectedBranch,
      });

      if (result.ok) {
        alert("Saved successfully!");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save file.");
    }
  };

  // Affichage des états
  if (status === "loading" && !content) return <p className="p-4">Loading…</p>;
  if (status === "error")
    return <p className="p-4 text-red-400">File not found or error loading.</p>;

  return (
    <div className="flex flex-col h-screen">
      <div className="p-3 bg-[#1e1e1e] text-gray-200 border-b border-gray-600 flex justify-between items-center">
        <div className="font-semibold">
          {fileName} ({selectedBranch})
        </div>

        <div className="flex gap-2">
          {/* Nouveau bouton Raw */}
          <button
            onClick={() => setIsRawMode(!isRawMode)}
            className={`px-3 py-1 rounded text-xs font-mono border ${
              isRawMode
                ? "bg-yellow-600 border-yellow-400 text-white"
                : "bg-gray-700 border-gray-500 text-gray-300"
            }`}
            title="Afficher avec/sans Frontmatter"
          >
            {isRawMode ? "RAW: ON" : "RAW: OFF"}
          </button>
          {/* Sélecteur de branche */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#2a2a2a] text-white px-2 py-1 rounded border border-gray-600"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <button
            disabled={status === "loading"}
            disabled={isRawMode === false}
            onClick={saveFile}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded"
          >
            {status === "loading" ? "..." : "Save"}
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
