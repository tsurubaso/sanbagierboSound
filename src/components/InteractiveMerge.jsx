"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { diffLines } from "diff";

export default function InteractiveMerge({ original, modified, onMerge }) {
  const [blocks, setBlocks] = useState([]);
  const [mergedText, setMergedText] = useState("");

  // Crée les blocs de diff
  useEffect(() => {
    const diff = diffLines(original, modified);
    const initialBlocks = diff.map((part, idx) => ({
      id: idx,
      value: part.value,
      added: part.added || false,
      removed: part.removed || false,
      choice: !part.added && !part.removed ? "both" : null,
    }));
    setBlocks(initialBlocks);
  }, [original, modified]);

  // Reconstruit le texte mergé
  useEffect(() => {
    const merged = blocks
      .map(block => {
        if (block.choice === "original" && block.removed) return block.value;
        if (block.choice === "modified" && block.added) return block.value;
        if (block.choice === "both" || (!block.added && !block.removed))
          return block.value;
        return "";
      })
      .join("");
    setMergedText(merged);

    if (onMerge) onMerge(merged);
  }, [blocks]);

  function handleChoice(id, choice) {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, choice } : b)));
  }

  return (
    <div className="flex gap-4">
      {/* Liste des blocs avec choix */}
      <div className="w-1/3 border-r pr-2 space-y-2 text-sm">
        <h2 className="font-bold mb-2">Résolution des conflits</h2>
        {blocks.map(block => (
          <div
            key={block.id}
            className={`p-2 rounded ${
              block.added
                ? "bg-green-100"
                : block.removed
                ? "bg-red-100"
                : "bg-gray-50"
            }`}
          >
            <pre className="whitespace-pre-wrap">{block.value}</pre>
            {(block.added || block.removed) && (
              <div className="mt-1 flex gap-2">
                <button
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  onClick={() => handleChoice(block.id, "original")}
                >
                  Original
                </button>
                <button
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                  onClick={() => handleChoice(block.id, "modified")}
                >
                  Modifié
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded"
                  onClick={() => handleChoice(block.id, "both")}
                >
                  Les deux
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Editeur de prévisualisation */}
      <div className="w-2/3 space-y-4">
        <Editor
          height="80vh"
          defaultLanguage="markdown"
          value={mergedText}
          options={{
            readOnly: false,
            wordWrap: "on",
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}
