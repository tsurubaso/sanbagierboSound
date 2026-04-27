import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
   //  fonctions lies a la gestion de fichiers audio
  openAudio: async () => {
    // Ask main process to open file and return file data
    const result = await ipcRenderer.invoke("open-audio-dialog");
    if (!result) return null;
    //console.log("result.path: ", result.path);

    // result = { buffer: <ArrayBuffer>, path: <string> }
    const ext = result.path.split(".").pop().toLowerCase();
    const mime =
      ext === "MP3"
        ? "audio/mpeg"
        : ext === "wav"
        ? "audio/wav"
        : "application/octet-stream";
    const blob = new Blob([result.buffer], { type: mime });
    const url = URL.createObjectURL(blob);

    return { url, path: result.path };
  },
  openAudio2: async () => {
  const result = await ipcRenderer.invoke("open-audio-dialog");
  if (!result) return null;

  const ext = result.path.split(".").pop().toLowerCase();
  const mime =
    ext === "mp3"
      ? "audio/mpeg"
      : ext === "wav"
      ? "audio/wav"
      : "application/octet-stream";

  const blob = new Blob([result.buffer], { type: mime });
  const url = URL.createObjectURL(blob);

  // IMPORTANT: return buffer too
  return { url, path: result.path, buffer: result.buffer };
},
  getUserMedia: (constraints) =>
    navigator.mediaDevices.getUserMedia(constraints),
 saveAudioFile: (options) =>
  // options est l'objet { fileName, data } passé par le renderer
  ipcRenderer.invoke("save-audio-file", options),

  //  fonctions lies a la gestion de fichiers markdown
  readBooksJson: () => ipcRenderer.invoke("read-books-json"),
  rescanBooks: () => ipcRenderer.invoke("rescan-books"), //
  readMarkdown: (filePath) => ipcRenderer.invoke("read-markdown", filePath),
  readMarkdownEditing: (filePath) =>
    ipcRenderer.invoke("read-markdown-editing", filePath),
  writeMarkdown: (filePath, content) =>
    ipcRenderer.invoke("write-markdown", { filePath, content }),

  //fonctions liées à Gitthub
  githubProfile: () => ipcRenderer.invoke("github-profile"),
  githubLogin: () => ipcRenderer.invoke("github-login"),
  githubPollToken: (deviceCode) =>
    ipcRenderer.invoke("github-poll-token", deviceCode),
  githubSession: () => ipcRenderer.invoke("github-session"),
  githubLogout: () => ipcRenderer.invoke("github-logout"),
  //fonctions de Sync
  githubPull: () => ipcRenderer.invoke("github-pull"),
  githubPush: () => ipcRenderer.invoke("github-push"),
  githubSync: () => ipcRenderer.invoke("github-sync"),
  onAuthSuccess: (callback) => {
    ipcRenderer.on("auth-success", callback);
    return () => ipcRenderer.removeListener("auth-success", callback);
  },

  // creer fichier
  createOrUpdateBook: (fileName, content) =>
    ipcRenderer.invoke("create-or-update-book", { fileName, content }),
  // effacer fichier
  eraseMarkdown: (book) => ipcRenderer.invoke("erase-markdown", book),
  ///Python child process
  runPythonSTT: (config) => ipcRenderer.invoke("run-python-stt", config),
  onPythonOutput: (callback) =>
    ipcRenderer.on("python-output", (_, data) => callback(data)),
  onPythonError: (callback) =>
    ipcRenderer.on("python-error", (_, data) => callback(data)),
  onPythonExit: (callback) =>
    ipcRenderer.on("python-exit", (_, code) => callback(code)),
  showOpenDialog: () => ipcRenderer.invoke("open-dialog"),
  selectTranscriptionFile: () => ipcRenderer.invoke("select-transcription"),
  readFile: (path) => ipcRenderer.invoke("read-file", path),



});

console.log("preload loaded");
