"use client";

import { useState, useEffect } from "react";
import InteractiveMerge from "@/components/InteractiveMerge";

export default function MergerPage({ book }) {
  const [branches, setBranches] = useState({});
  const [branchList, setBranchList] = useState([]);
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [mergedText, setMergedText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // États pour la sécurité de suppression
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Chargement initial des branches et contenus
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/forgejo/merge?book=${book}`);
      const data = await res.json();
      if (data.error) {
        console.error("❌", data.error);
        return;
      }
      setBranchList(data.branches);
      setBranches(data.contents);
    }
    load();
  }, [book]);

  // Réinitialiser le statut de sécurité si la branche source change
  useEffect(() => {
    setSafetyStatus(null);
  }, [sourceBranch]);

  const isMergeDisabled =
    !sourceBranch ||
    !targetBranch ||
    sourceBranch === targetBranch ||
    sourceBranch === "main";

  // Sauvegarde du résultat fusionné
  async function handleSave() {
    if (!hasChanges || !targetBranch) return;

    try {
      const res = await fetch("/api/forgejo/save-merged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, targetBranch, mergedText }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Fusion enregistrée sur : ${targetBranch}`);
        setHasChanges(false);

        // Rafraîchir les données
        const refresh = await fetch(`/api/forgejo/merge?book=${book}`);
        const data2 = await refresh.json();
        setBranches(data2.contents);
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } catch (err) {
      alert("❌ Erreur réseau : " + err.message);
    }
  }

  // Vérification de sécurité avant suppression
  async function checkBranchSafety() {
    setIsChecking(true);
    try {
      const res = await fetch("/api/forgejo/check-branch-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceBranch }),
      });
      const data = await res.json();
      setSafetyStatus(data);

      if (data.isSafeToDelete) {
        alert(
          `✅ OK : Tous les fichiers de "${sourceBranch}" sont identiques à "main".`,
        );
      } else {
        const list = data.remainingFiles
          .map((f) => `- ${f.path} (${f.reason})`)
          .join("\n");
        alert(`⚠️ Attention ! Fichiers non identiques :\n${list}`);
      }
    } catch (err) {
      alert("Erreur lors de la vérification");
    } finally {
      setIsChecking(false);
    }
  }

  // Suppression effective de la branche
  async function handleDeleteBranch() {
    if (!confirm(`Confirmer la suppression définitive de : ${sourceBranch} ?`))
      return;

    const res = await fetch("/api/forgejo/delete-branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch: sourceBranch }),
    });

    const data = await res.json();
    if (data.success) {
      alert("🗑 Branche supprimée");
      window.location.reload();
    } else {
      alert("❌ Erreur lors de la suppression");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Fusion interactive</h1>

      {/* Sélecteurs Source/Cible */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Source</label>
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
          <label className="block text-sm font-semibold mb-1">Cible</label>
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

      {/* Actions sur les branches */}
      <div className="flex items-center gap-4 mb-8">
        <button
          disabled={isMergeDisabled}
          onClick={() => setHasChanges(false)}
          className={`px-4 py-2 rounded font-semibold ${isMergeDisabled ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {isMergeDisabled
            ? "Fusion impossible"
            : `Fusionner ${sourceBranch} → ${targetBranch}`}
        </button>

        {sourceBranch && sourceBranch !== "main" && (
          <button
            onClick={checkBranchSafety}
            disabled={isChecking}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isChecking ? "Vérification..." : "🔍 Vérifier si supprimable"}
          </button>
        )}

        {safetyStatus?.isSafeToDelete && (
          <button
            onClick={handleDeleteBranch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Supprimer définitivement {sourceBranch}
          </button>
        )}
      </div>
      {/* Interface de Merge */}
      {sourceBranch && targetBranch && !isMergeDisabled && (
        <div className="mt-8 space-y-4">
          {/* ⚡ ACTION RAPIDE */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!confirm(`Remplacer ${targetBranch} par ${sourceBranch} ?`))
                  return;

                const fullText = branches[sourceBranch] || "";
                setMergedText(fullText);
                setHasChanges(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              ⚡ Copier entièrement {sourceBranch} → {targetBranch}
            </button>
          </div>

          {/* 🧠 DIFF INTERACTIF */}
          <InteractiveMerge
            original={branches[targetBranch]}
            modified={branches[sourceBranch]}
            onMerge={(text) => {
              setMergedText(text);
              setHasChanges(true);
            }}
          />

          {/* 💾 SAVE */}
          {hasChanges && (
            <button
              onClick={handleSave}
              className="fixed bottom-10 right-10 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
              💾 Enregistrer dans {targetBranch}
            </button>
          )}
        </div>
      )}
      {/* Interface de Merge */}
      {sourceBranch && targetBranch && !isMergeDisabled && (
        <div className="mt-8">
          <InteractiveMerge
            original={branches[targetBranch]}
            modified={branches[sourceBranch]}
            onMerge={(text) => {
              setMergedText(text);
              setHasChanges(true);
            }}
          />

          {/* Bouton de sauvegarde flottant */}
          {hasChanges && (
            <button
              onClick={handleSave}
              className="fixed bottom-10 right-10 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all"
            >
              💾 Enregistrer dans {targetBranch}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
