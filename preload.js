const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openAudio: () => ipcRenderer.invoke("open-audio-dialog"),
  deleteRegion: (args) => ipcRenderer.invoke("delete-region", args)
});
