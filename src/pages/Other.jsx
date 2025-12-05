import React from "react";

export default function AudioProcessingPage() {
  return (
    <div className="p-6 space-y-10 text-gray-200">
      <h1 className="text-3xl font-bold">🎧 Processus Audio & Librairies Avancées</h1>

      <p className="text-lg">
        Cette page présente les différentes étapes critiques du traitement audio
        ainsi que les librairies utilisées pour optimiser un signal vocal destiné
        aux modèles de transcription IA. Cette section explore d'autres
        traitements audio avancés pouvant être intégrés via WebAudio, WASM et des
        modules spécialisés.
      </p>

      {/* Section 1 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">1. ⚙️ Workflow Optimal</h2>
        <p>
          Le traitement audio suit un ordre strict pour garantir une qualité
          maximale et optimiser l'analyse IA.
        </p>

        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Réduction du bruit (RNNoise)</strong> — Nettoyage ML avancé.</li>
          <li><strong>Suppression des silences</strong> — Réduit la taille et focus IA.</li>
          <li><strong>Normalisation du pic</strong> — Maximiser le niveau global.</li>
          <li><strong>Compression dynamique</strong> — Niveau constant.</li>
          <li><strong>EQ / De-essing</strong> — Corrections qualitatives.</li>
          <li><strong>Exportation WAV</strong> — Format idéal pour l'analyse IA.</li>
        </ol>
      </section>

      {/* Section 2 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">2. 🧰 Librairies Recommandées</h2>
        <p>Voici les outils clés pour chaque étape du traitement audio :</p>

        <ul className="list-disc list-inside space-y-1">
          <li><strong>rnnoise-wasm</strong> — Débruitage vocal haute précision.</li>
          <li><strong>audio-buffer-utils</strong> — Normalisation et manipulation audio.</li>
          <li><strong>Web Audio API</strong> — Compression, EQ, filtres, pipeline natif.</li>
          <li><strong>wavefile / audiobuffer-to-wav</strong> — Export WAV non compressé.</li>
          <li><strong>Custom Logic (JS)</strong> — Analyse RMS, silence-trimming.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">3. 🧠 Stratégie et Justification</h2>
        <p>
          L'objectif est d'obtenir un signal propre, stable et optimisé. Les points
          essentiels sont :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>RNNoise est crucial pour réduire les erreurs IA liées au bruit.</li>
          <li>La suppression de silence dépend du contexte, donc custom.</li>
          <li>La Web Audio API offre de hautes performances pour les traitements.</li>
        </ul>
      </section>

    </div>
  );
}
