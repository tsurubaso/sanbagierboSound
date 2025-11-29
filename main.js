const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
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
  const result = await dialog.showOpenDialog({
    filters: [{ name: "Audio", extensions: ["wav", "mp3"] }]
  });
  return result.filePaths[0];
});

// -------- DELETE REGION USING FFMPEG ----------
ipcMain.handle("delete-region", async (event, args) => {
  return deleteRegion(args.file, args.start, args.end);
});
