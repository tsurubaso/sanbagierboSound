const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");
//const { spawn } = require('child_process');
//const ffmpegPath = require('ffmpeg-static');
const { deleteRegion } = require("./ffmpeg");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadURL("http://localhost:5173"); // Vite or React dev server
}

app.whenReady().then(createWindow);

// -------- FILE OPEN ------------
ipcMain.handle("open-audio-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Audio", extensions: ["wav", "mp3"] }],
    properties: ["openFile"],
  });

  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
   console.log("filePaths:", filePaths[0]);
   console.log("filePath:", filePath);

  // Read file as Buffer
  const buffer = fs.readFileSync(filePath);////////////////////////////////

  // Convert buffer to ArrayBuffer for IPC
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return { buffer: arrayBuffer, path: filePath };
});

// -------- DELETE REGION USING FFMPEG ----------
ipcMain.handle("delete-region", async (event, args) => {
  return deleteRegion(args.file, args.start, args.end);
});
