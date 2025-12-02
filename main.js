const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");


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
  win.setMenuBarVisibility(false);
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
ipcMain.handle("save-audio-file", async (event, { fileName, data }) => {
  try {
    const filePath = path.join(__dirname, "public", "audio", fileName);
    
    // Créer le dossier s'il n'existe pas
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Écrire le fichier
    await fs.promises.writeFile(filePath, Buffer.from(data));

    console.log("✅ Audio saved:", filePath);
    return { ok: true, path: filePath };
  } catch (err) {
    console.error("❌ Error saving audio:", err);
    return { ok: false, error: err.message };
  }
});
