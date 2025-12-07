import React from "react";

export default function AudioProcessingPage() {
  return (
    <div className="p-6 space-y-10 text-gray-200">
      <h1 className="text-3xl font-bold">🎧 Processus Audio & Pipeline de Traitement</h1>

      <p className="text-lg">
        Cette page décrit le pipeline actuel de traitement audio utilisé dans l’application,
        ainsi que les améliorations prévues. L’objectif est d’obtenir un signal vocal propre,
        stable, optimisé, et parfaitement adapté aux modèles de transcription IA.
      </p>

      {/* Section 1 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">1. ⚙️ Workflow Actuel (implémenté)</h2>
        <p>
          L’application suit un ordre précis afin de garantir une qualité maximale :
        </p>

        <ol className="list-decimal list-inside space-y-3">
          <li>
            <strong>Réduction du bruit (High-pass / Low-pass / Compression légère)</strong><br/>
            Suppression du bruit grave/aigu et égalisation du volume.
          </li>

          <li>
            <strong>Normalisation (Peak Normalization)</strong><br/>
            Augmente le niveau global sans distorsion.
          </li>

          <li>
            <strong>Compression Dynamique</strong><br/>
            Stabilise les variations de volume et rend la voix plus cohérente.
          </li>

          <li>
            <strong>Égalisation (EQ)</strong><br/>
            Amélioration de la clarté vocale.
          </li>

          <li>
            <strong>Suppression intelligente des silences</strong><br/>
            Détection RMS + fenêtres glissantes, avec padding pour éviter les coupes brutales.
          </li>

          <li>
            <strong>Export WAV</strong><br/>
            Encodage manuel (PCM 16-bit) pour un format IA-friendly.
          </li>
        </ol>
      </section>

      {/* Section 2 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">2. 🧰 Librairies & Technologies utilisées</h2>
        <p>
          Le pipeline repose exclusivement sur des outils sûrs et performants :
        </p>

        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Web Audio API</strong> — filtres, compresseur, EQ, OfflineAudioContext.
          </li>
          <li>
            <strong>Wavesurfer.js</strong> — visualisation et pré-écoute.
          </li>
          <li>
            <strong>Custom Logic (JS)</strong> — analyse RMS, détection et trimming des silences.
          </li>
          <li>
            <strong>audiobuffer-to-wav (logic custom intégré)</strong> — export WAV PCM.
          </li>
          <li>
            <strong>Electron IPC</strong> — chargement et sauvegarde des fichiers audio.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">3. 🧠 Justification Technique</h2>

        <ul className="list-disc list-inside space-y-2">
          <li>La réduction de bruit donne un signal plus clair pour les modèles IA.</li>
          <li>La normalisation et la compression stabilisent le niveau.</li>
          <li>Le silence trimming réduit la taille et focalise sur la parole utile.</li>
          <li>Les filtres WebAudio sont rapides, offline et sans dépendances dangereuses.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">4. 🧩 Améliorations Futures (Wishlist)</h2>
        <p>
          Ces traitements pourront être ajoutés dans une prochaine version :
        </p>

        <ul className="list-disc list-inside space-y-3">
          <li>
            ⭐ <strong>De-Esser</strong><br/>
            Réduction des “sss” et consonnes sifflantes via un band-pass + compression.
          </li>

          <li>
            ⭐ <strong>Limiter (Brickwall)</strong><br/>
            Empêche tout clip numérique et permet un volume maximal propre.
          </li>

          <li>
            ⭐ <strong>Gate intelligent (Voice Activity Detection)</strong><br/>
            Réduction du bruit uniquement hors parole — upgrade du gate simple actuel.
          </li>

          <li>
            ⭐ <strong>Loudness Target (LUFS)</strong><br/>
            Normalisation vers des standards pro (ex: −16 LUFS pour podcasts).
          </li>

          <li>
            ⭐ <strong>Resampling optimisé</strong><br/>
            48 kHz → option idéal pour les modèles de transcriptions.
          </li>
        </ul>
      </section>
    </div>
  );
}
