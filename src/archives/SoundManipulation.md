| Procédé                  | Méthode Recommandée    | Librairie / Outil                  | Justification                                      |
| ------------------------ | ---------------------- | ---------------------------------- | -------------------------------------------------- |
| Réduction du Bruit       | Algorithme ML          | **rnnoise-wasm**                   | Standard moderne, excellente qualité pour la voix. |
| Suppression des Silences | Analyse RMS + seuil    | **Custom JS**                      | Flexible, adaptable selon l’environnement sonore.  |
| Normalisation (Pic)      | Peak Normalization 0dB | **audio-buffer-utils.normalize()** | Simple, efficace, rapide.                          |
| Compression Dynamique    | DynamicsCompressorNode | **Web Audio API / tone.js**        | Implémentation native optimisée.                   |


[AUDIO SOURCE]
     ↓
Electron capture / import
     ↓
Raw AudioBuffer stored in state
     ↓
WaveSurfer BEFORE visualizer
     ↓
[ PROCESSORS ]
    1. RNNoise denoise
    2. Remove silence
    3. Normalize peak
    4. Compress dynamics
    ...
     ↓
WaveSurfer AFTER visualizer
     ↓
Export WAV
