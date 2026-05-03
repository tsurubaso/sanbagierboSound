"use client";

import { useState } from "react";
import InteractiveMerge from "@/components/InteractiveMerge";

export default function MergerClient({ book, branchList, branchContents }) {
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [mergedText, setMergedText] = useState("");
  const [mergeDone, setMergeDone] = useState(false);

  function handleMergeComplete(text) {
    setMergedText(text);
    setMergeDone(true);
  }

  async function handleEraseAndSave() {
    if (!mergeDone || !targetBranch) return;
    console.log(`💾 Saving merged content to ${targetBranch}...`);

    // Example placeholder (you’ll connect your save route here)
    // await fetch(`/api/github/save`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     book,
    //     branch: targetBranch,
    //     content: mergedText,
    //   }),
    // });

    alert(`Merged content saved to ${targetBranch}`);
    setMergeDone(false);
  }

  const isMergeDisabled =
    !sourceBranch ||
    !targetBranch ||
    sourceBranch === targetBranch ||
    sourceBranch === "master";

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Fusion interactive manuelle</h1>
      <p className="mb-4 text-sm text-gray-500">
        Sélectionnez deux branches à comparer et fusionner.
      </p>

      {/* Dropdowns */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-semibold">Source</label>
          <select
            value={sourceBranch}
            onChange={(e) => setSourceBranch(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">-- Choisir --</option>
            {branchList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold">Cible</label>
          <select
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">-- Choisir --</option>
            {branchList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Merge button */}
      <button
        disabled={isMergeDisabled}
        onClick={() => setMergeDone(false)}
        className={`px-4 py-2 rounded font-semibold ${
          isMergeDisabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isMergeDisabled
          ? "Fusion impossible"
          : `Fusionner ${sourceBranch} → ${targetBranch}`}
      </button>

      {/* Interactive merge view */}
      {sourceBranch && targetBranch && !isMergeDisabled && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">
            Comparaison : {sourceBranch} → {targetBranch}
          </h2>
          <InteractiveMerge
            original={branchContents[targetBranch]}
            modified={branchContents[sourceBranch]}
            onMerge={handleMergeComplete}
          />

          {mergeDone && (
            <div className="mt-4">
              <button
                onClick={handleEraseAndSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                💾 Erase target and Save merged result
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
