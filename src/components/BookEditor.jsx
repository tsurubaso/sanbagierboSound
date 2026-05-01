// src/components/BookEditor.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { getBooksData } from "@/services/getBooksData.jsx";

export default function BookEditor() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("loading");
  const [fileName, setFileName] = useState("");
  const [book, setBook] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("main");
  const navigate = useNavigate();
  const { link } = useParams();

  console.log("📖 BookEditor mounted with link:", link);

  useEffect(() => {
    const loadMeta = async () => {
      const data = await getBooksData();
      const found = data.find((b) => b.link === link);

      if (!found) {
        console.error("❌ Book not found:", link);
        setStatus("error");
        return;
      }

      setBook(found);
      setFileName(found.name);

      // 🔥 Fetch branches ONLY here
      const branchList = await window.electronAPI.getFileBranches({
        fileName: found.name,
      });

      setBranches(branchList);
      console.log("✅ Available branches:", branchList);
    };

    loadMeta();
  }, [link]);

  useEffect(() => {
    if (!book) return;

    const loadContent = async () => {
      setStatus("loading");

      try {
        const content = await window.electronAPI.readMarkdown({
          url: `${book.url}?ref=${selectedBranch}`,
        });

        setContent(content);
        setStatus("ready");
      } catch (err) {
        console.error("❌ Failed to load content:", err);
        setStatus("error");
      }
    };

    loadContent();
  }, [book, selectedBranch]);

  const saveFile = async () => {
    if (!book) return;

    try {
      const result = await window.electronAPI.writeMarkdown({
        fileName: book.name,
        content, // Le contenu actuel de l'éditeur
        branch: selectedBranch, // 🔥 REQUIRED
      });

      console.log("💾 Saving:", {
        fileName: book?.name,
        contentLength: content.length,
        branch: selectedBranch,
      });

      if (result.ok) {
        console.log("✅ Saved successfully");
      } else {
        throw new Error(result.error);
      }
      alert("Saved!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save file.");
    }
  };

  const deleteFile = async () => {
    ////we implement that later
    if (!book) return;

    if (!window.confirm(`⚠️ Are you sure you want to delete ${book.name}?`))
      return;

    try {
      await window.electronAPI.eraseMarkdown({
        fileName: book.name,
        branch: selectedBranch, // 🔥 REQUIRED
      });

      alert(`✅ ${book.name} deleted.`);
      navigate("/");

      window.electronAPI
        .rescanBooks()
        .catch((err) => console.error("Rescan failed:", err));
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
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#2a2a2a] text-white px-2 py-1 rounded"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button
            disabled={status !== "ready"}
            onClick={saveFile}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded"
          >
            Save
          </button>

          <button
            disabled //</div>={status !== "ready"} // we disable delete for now
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
