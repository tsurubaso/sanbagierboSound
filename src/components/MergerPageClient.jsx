"use client";

import { useState, useEffect } from "react";
import InteractiveMerge from "@/components/InteractiveMerge";
import { getBooksData } from "@/services/getBooksData.jsx";

export default function MergerPage({ book }) {
  const [branches, setBranches] = useState({});
  const [branchList, setBranchList] = useState([]);
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [mergedText, setMergedText] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  // const [book, setBook] = useState(null);
  const [status, setStatus] = useState("loading");

  // États pour la sécurité de suppression
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Chargement initial des branches et contenus
  // 1. Charger les métadonnées et la liste des branches au montage
  useEffect(() => {
    if (!book) return;

    const loadData = async () => {
      try {
        const data = await getBooksData();
        const found = data.find((b) => b.link === book);

        if (!found) {
          setStatus("error");
          return;
        }

        // 1. Récupérer la liste des noms de branches
        const names = await window.electronAPI.getFileBranches({
          fileName: found.name,
        });
        setBranchList(names); // On remplit la liste pour les <select>

        // 2. Charger le contenu textuel de CHAQUE branche
        // Pour que branches[targetBranch] fonctionne dans ton InteractiveMerge
        const contentsMap = {};

        for (const branchName of names) {
          // On construit l'URL dynamique comme on l'a vu pour l'éditeur
          const dynamicUrl = found.url.replace(
            /\/branch\/[^/]+/,
            `/branch/${branchName}`,
          );

          const text = await window.electronAPI.readMarkdown({
            url: `${dynamicUrl}?t=${Date.now()}`,
          });

          contentsMap[branchName] = text;
        }

        setBranches(contentsMap); // On remplit l'objet { main: "...", ver2: "..." }
        setStatus("ready");
        console.log("✅ Données de fusion prêtes :", contentsMap);
      } catch (err) {
        console.error("❌ loadData failed:", err);
        setStatus("error");
      }
    };

    loadData();
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

  // On demande confirmation car on va écraser la cible
  if (!confirm(`Voulez-vous vraiment écraser le contenu de "${targetBranch}" avec le résultat de la fusion ?`)) {
    return;
  }

  try {
    // 1. On appelle le handler IPC que tu as partagé
    // Note: book contient le link, on ajoute .md si tes fichiers finissent ainsi
    const result = await window.electronAPI.writeMarkdown({
      fileName: book.endsWith(".md") ? book : `${book}.md`,
      content: mergedText, // Le texte issu de InteractiveMerge
      branch: targetBranch, // On sauve sur la branche cible
    });

    if (result.ok) {
      alert(`✅ Fusion réussie et enregistrée sur la branche : ${targetBranch}`);
      setHasChanges(false);

      // 2. Mettre à jour l'état local pour refléter le changement immédiatement
      setBranches((prev) => ({
        ...prev,
        [targetBranch]: mergedText,
      }));
      
    } else {
      alert(`❌ Erreur lors de la sauvegarde : ${result.error}`);
    }
  } catch (err) {
    console.error("Erreur Save Fusion:", err);
    alert("❌ Erreur critique lors de la sauvegarde.");
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
    {/* Header avec Titre et Bouton de Fusion à droite */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">Fusion interactive</h1>
      
      <div className="flex gap-2">
         {/* Bouton de Fusion déplacé ici */}
         <button
          disabled={isMergeDisabled}
          onClick={() => setHasChanges(false)}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            isMergeDisabled 
              ? "bg-gray-700 text-gray-500 border border-gray-600 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          }`}
        >
          {isMergeDisabled
            ? "Choisir les branches"
            : `Fusionner ${sourceBranch} → ${targetBranch}`}
        </button>
      </div>
    </div>

    {/* Section des Sélecteurs (plus compacte) */}
    <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-700 flex gap-6 mb-8">
      <div className="flex-1">
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Branche Source (Modifications)</label>
        <select
          value={sourceBranch}
          onChange={(e) => setSourceBranch(e.target.value)}
          className="w-full bg-[#2a2a2a] text-white border border-gray-600 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Choisir la source --</option>
          {branchList.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center pt-6">
        <span className="text-gray-500">→</span>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Branche Cible (À écraser)</label>
        <select
          value={targetBranch}
          onChange={(e) => setTargetBranch(e.target.value)}
          className="w-full bg-[#2a2a2a] text-white border border-gray-600 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Choisir la cible --</option>
          {branchList.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Interface de Merge */}
    {sourceBranch && targetBranch && !isMergeDisabled && (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        {/* Barre d'outils d'action rapide */}
        <div className="flex justify-between items-center bg-[#252525] p-3 rounded border-l-4 border-purple-500">
          <span className="text-sm text-gray-300">
            Mode fusion activé entre <strong>{sourceBranch}</strong> et <strong>{targetBranch}</strong>
          </span>
          <button
            onClick={() => {
              if (!confirm(`Remplacer totalement ${targetBranch} par ${sourceBranch} ?`)) return;
              setMergedText(branches[sourceBranch] || "");
              setHasChanges(true);
            }}
            className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded hover:bg-purple-600 hover:text-white transition-all text-sm font-medium"
          >
            ⚡ Tout copier de {sourceBranch}
          </button>
        </div>

        {/* Le Diff interactif prend le reste de la place */}
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1e1e1e]">
          <InteractiveMerge
            original={branches[targetBranch]}
            modified={branches[sourceBranch]}
            onMerge={(text) => {
              setMergedText(text);
              setHasChanges(true);
            }}
          />
        </div>

        {/* Bouton de sauvegarde flottant */}
        {hasChanges && (
          <button
            onClick={handleSave}
            className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold z-50"
          >
            <span className="text-xl">💾</span> Enregistrer la fusion dans {targetBranch}
          </button>
        )}
      </div>
    )}
  </div>
);
}
