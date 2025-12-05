| Procédé                  | Méthode Recommandée    | Librairie / Outil                  | Justification                                      |
| ------------------------ | ---------------------- | ---------------------------------- | -------------------------------------------------- |
| Réduction du Bruit       | Algorithme ML          | **rnnoise-wasm**                   | Standard moderne, excellente qualité pour la voix. |
| Suppression des Silences | Analyse RMS + seuil    | **Custom JS**                      | Flexible, adaptable selon l’environnement sonore.  |
| Normalisation (Pic)      | Peak Normalization 0dB | **audio-buffer-utils.normalize()** | Simple, efficace, rapide.                          |
| Compression Dynamique    | DynamicsCompressorNode | **Web Audio API / tone.js**        | Implémentation native optimisée.                   |


