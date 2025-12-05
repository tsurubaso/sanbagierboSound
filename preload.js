const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openAudio: async () => {
    // Ask main process to open file and return file data
    const result = await ipcRenderer.invoke("open-audio-dialog");
    if (!result) return null;
    console.log("result.path: ", result.path);

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
getUserMedia: (constraints) => navigator.mediaDevices.getUserMedia(constraints),
  saveAudioFile: (fileName, data) => 
  ipcRenderer.invoke("save-audio-file", { fileName, data }),
});
