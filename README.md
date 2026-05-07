# SanBagierboDesk

Local-first Electron workstation for writing, audio processing, transcription, and Forgejo-based editorial workflows.

## Features

### Markdown Editorial System
- Monaco Editor integration
- YAML frontmatter support
- Automatic Markdown file creation/update
- Forgejo repository synchronization
- Branch-aware workflow

### Audio Workspace
- WaveSurfer.js waveform visualization
- Audio playback and zoom controls
- WAV / MP3 loading
- Timeline navigation
- Region-based audio cleaning
- Non-destructive editing workflow
- WAV export after region removal

### Local AI Transcription
- Faster-Whisper local transcription
- Python subprocess integration
- Offline speech-to-text pipeline
- French language optimized workflow
- Automatic transcription import into editor

### Electron Desktop Architecture
- IPC communication layer
- Secure preload bridge
- Native file dialogs
- Persistent local storage with electron-store
- Local filesystem access

### Forgejo Integration
- Markdown synchronization
- File creation/update API
- Branch listing and selection
- Repository scanning
- Metadata extraction from Markdown frontmatter

### Developer Tooling
- Madge dependency graph support
- Documentation.js integration
- Modular React component architecture
- TailwindCSS UI
- Vite development environment

---

## Tech Stack

- Electron
- React
- Vite
- TailwindCSS
- Monaco Editor
- WaveSurfer.js
- Faster-Whisper
- Python
- Forgejo API

---

## Current Workflow

1. Import or record audio
2. Clean waveform using regions
3. Export cleaned WAV
4. Transcribe locally with Whisper
5. Import transcription into Markdown editor
6. Edit metadata/content
7. Save directly to Forgejo

---

## Philosophy

- Local-first
- Offline-capable
- AI-assisted
- Git-native editorial workflow
- Open-source friendly
- Modular architecture