

## 📻 WaveSurfer Electron App

Une application de bureau construite avec **Electron**, **React**, et **WaveSurfer.js**, conçue pour la visualisation et le traitement audio. Le projet se concentre sur les **flux de travail de nettoyage de la voix** tels que la suppression du silence, la normalisation des niveaux et la préparation de l'audio parlé.

Cette application comprend également un ensemble de **démos de plugins interactifs** pour WaveSurfer.js, chacun affiché sur une page dédiée.

-----

## 🚀 Fonctionnalités

### 🎨 Visualisation de Forme d'Onde

  - Utilise **WaveSurfer.js** pour une visualisation audio de haute qualité.
  - Prend en charge le chargement de fichiers audio via la boîte de dialogue native d'Electron.
  - Couleurs personnalisées, zoom et mise en page réactive.

### 🔌 Démos de Plugins WaveSurfer

Chaque plugin est expliqué et démontré dans des pages dédiées :

  - **Hover Plugin** — Affiche un indicateur d'horodatage lorsque vous survolez la forme d'onde.
  - **Timeline Plugin** — Ajoute une règle de chronologie synchronisée avec l'audio.
  - Plus de pages de plugins sont prévues.

### 🎚️ Traitement Audio (Travail en Cours)

L'objectif de l'application est de fournir des **outils de traitement pratiques orientés voix** :

  - Suppression du silence
  - Réduction du bruit (**RNNoise**)
  - Normalisation
  - Compression dynamique
  - Égalisation
  - Exportation vers **WAV / MP3**

**Utilise :**

  - **Web Audio API**
  - `audio-buffer-utils`
  - `wavefile` pour l'encodage WAV
  - `rnnoise-wasm` pour la réduction du bruit

-----

## 🏗️ Pile Technologique

  - **Electron** (Main / Preload / Renderer)
  - **React** + **Vite**
  - **WaveSurfer.js**
  - **TailwindCSS** pour l'interface utilisateur
  - **React Router** pour la navigation des plugins

-----

## 📁 Structure du Projet

```
src/
  pages/
    Plugins.jsx
    plugins/
      HoverPlugin.jsx
      TimelinePlugin.jsx
  components/
  main/
    main.js
    preload.js
```

-----

## ⚙️ Comment Ça Marche

### Electron Preload

  - Pont sécurisé exposant `openAudio()` et `saveAudioFile()`.
  - Permet de sélectionner un fichier audio et de le transformer en une **URL Blob** pour WaveSurfer.

### Intégration WaveSurfer

Chaque page de plugin :

  - Crée une instance **WaveSurfer**
  - Charge l'audio depuis **Electron**
  - Active un **plugin**
  - Nettoie l'instance au **démontage**

-----

## 🧪 Développement

Exécutez l'application en mode développement :

```bash
yarn dev
```

ou

```bash
npm run dev
```

-----

## 📦 Build

```bash
npm run build
```

-----

## 🙏 Crédits

Ce projet a été développé avec l'aide de **ChatGPT (OpenAI)** — fournissant des conseils, des suggestions d'architecture, une aide à l'intégration de WaveSurfer, un support de débogage Electron et la génération complète de composants.

-----

## 📝 Licence

**Licence MIT.**

-----

Voulez-vous que je résume les principales fonctionnalités ou technologies utilisées ?