import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

import Store from "electron-store";

import { spawn } from "child_process";

import { app, BrowserWindow, shell, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const store = new Store();

// FIX: gérer le path correctement en prod (Electron packagé)
const BASE_PATH = app.isPackaged ? process.resourcesPath : __dirname;

const OUTPUT_DIR = path.join(BASE_PATH, "output");

// GLOBAL WINDOW
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(BASE_PATH, "favicon.ico"), // FIX: BASE_PATH
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(BASE_PATH, "preload.js"),
      sandbox: false, // !!!!!!!!!!!!!!!!!!//,
    },
  });

  console.log("BrowserWindow created");

  win.loadURL("http://localhost:5173"); //👉 en prod ça va casser
  win.webContents.openDevTools();
  win.setMenuBarVisibility(true);

  // >>> Indispensable pour autoriser micro
  win.webContents.session.setPermissionRequestHandler(
    (wc, permission, cb, details) => {
      const url = new URL(details.requestingUrl);

      // Autoriser uniquement ton app locale (Vite dev ici)
      if (url.origin === "http://localhost:5173") {
        if (permission === "media") {
          // Optionnel : filtrer audio uniquement
          if (details.mediaTypes?.includes("audio")) {
            return cb(true);
          }
        }
      }

      cb(false);
    },
  );
}

// ============================
// 📚 FORGEJO API (NEW SOURCE)
// ============================

const NEXT_PUBLIC_ASSETS_URL = process.env.Visual_Data_Source_URL;

const USER = process.env.FORGEJO_USER;
const FORGEJO_REPO = process.env.FORGEJO_REPO;
const FORGEJO_TOKEN = process.env.FORGEJO_TOKEN;
const REPO = `${USER}/${FORGEJO_REPO}`; // TODO: à externaliser

// FIX: centraliser config
const FORGEJO_BASE = process.env.FORGEJO_URL || "http://localhost:3000";

//  SCANNER LES LIVRES sur Forgejo
async function fetchBooksFromRepo() {
  try {
    const response = await fetch(
      `${FORGEJO_BASE}/api/v1/repos/${REPO}/contents/public/books`,
      {
        headers: {
          Authorization: `token ${FORGEJO_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Forgejo API error: " + response.status);
    }

    const data = await response.json();

    const books = data
      .filter((file) => file.type === "file") // FIX: éviter dossiers
      .map((file) => ({
        name: file.name,
        path: file.path,
        status: file.status,
        url: file.download_url, //////////////////////////////// FIX: standardiser clé
      }));

    store.set("books", books);
    store.set("books_last_scan", new Date().toISOString());

    return books;
  } catch (err) {
    console.error("❌ Forgejo fetch error:", err);

    // FIX: fallback cache local
    return store.get("books", []);
  }
}



// ============================
// IPC BOOKS
// ============================

//get books list meta data (name + url) from store (mise à jour auto via setInterval)
ipcMain.handle("read-books-json", () => {
  return store.get("books", []);
});

// Rescanner les livres depuis Forgejo (manual via UI) - 
//  IPC HANDLER : Forcer un rescan
ipcMain.handle("rescan-books", async () => {
  return await fetchBooksFromRepo();
});

// ============================
// 📄 READ MARKDOWN (Forgejo)
// ============================



////rewite avec l'appel API Forgejo (download_url) - FIX: standardiser clé url dans store





//  lire via URL (Forgejo download_url) - FIX: standardiser clé url dans store
ipcMain.handle("read-markdown", async (event, url) => {
  try {
    const response = await fetch(url);
    const content = await response.text();

    return content.replace(/^---[\s\S]+?---\s*/, "");
  } catch (err) {
    console.error("Markdown read error:", err);
    throw err;
  }
});

// IPC pour lire un fichier Markdown
ipcMain.handle("read-markdown-editing", async (event, url) => {
  try {
    const response = await fetch(url);
    const content = await response.text();

    return content;
  } catch (err) {
    console.error("Markdown read error:", err);
    throw err;
  }
});


// ----------------------
//  PULL
// ----------------------
ipcMain.handle("github-pull", async () => {
  try {
    await gitSub.pull("origin");
    await gitParent.pull("origin");
    return { success: true };
  } catch (err) {
    console.error("Pull error:", err);
    return { success: false, error: err.message };
  }
});

// ----------------------
//  PUSH
// ----------------------
ipcMain.handle("github-push", async () => {
  const token = store.get("github_token");
  if (!token) return { success: false, error: "No token" };

  try {
    await gitSub.add(".");
    await gitSub.commit("Update books from Electron").catch(() => {});
    await gitSub.push(["origin", "master"]); // ou "main" si applicable

    await gitParent.add("public/books");
    await gitParent.commit("Update submodule pointer").catch(() => {});
    await gitParent.push(["origin", "main"]);

    return { success: true };
  } catch (err) {
    console.error("Push error:", err);
    return { success: false, error: err.message };
  }
});

// ----------------------
//  SYNC (pull + push)
// ----------------------
ipcMain.handle("github-sync", async () => {
  try {
    await gitSub.pull("origin");
    await gitParent.pull("origin");

    await gitSub.add(".");
    await gitSub.commit("Sync from Electron").catch(() => {});
    await gitSub.push("origin", "master");

    await gitParent.add("public/books");
    await gitParent.commit("Sync submodule pointer").catch(() => {});
    await gitParent.push("origin", "main");

    return { success: true };
  } catch (err) {
    console.error("Sync error:", err); //  IPC HANDLER : Forcer un rescan
    return { success: false, error: err.message };
  }
});

//create and save a book
ipcMain.handle(
  "create-or-update-book",
  async (event, { fileName, content }) => {
    try {
      const booksDir = path.join(__dirname, "public", "books"); // ton submodule

      // si le dossier n'existe pas
      if (!fs.existsSync(booksDir)) {
        dialog.showMessageBox({
          type: "error",
          title: "Dossier introuvable",
          message: `Le dossier des livres n'existe pas :\n${booksDir}`,
        });
      }

      const filePath = path.join(booksDir, `${fileName}.md`);

      // Vérifier si le fichier existe déjà
      if (fs.existsSync(filePath)) {
        return {
          ok: false,
          error: `Le fichier '${fileName}.md' existe déjà.`,
        };
      }
      //ecrire le file
      await fs.promises.writeFile(filePath, content, "utf-8");

      console.log("📘 Book saved:", filePath);
      return { ok: true, fileName: filePath };
    } catch (err) {
      console.error("❌ Error saving book:", err);
      return { success: false, error: err.message };
    }
  },
);
//effacer
ipcMain.handle("erase-markdown", async (event, book) => {
  try {
    const filePath = path.join(__dirname, "public", "books", `${book}.md`);
    if (!fs.existsSync(filePath)) throw new Error("File not found");

    await fs.promises.unlink(filePath);
    return { ok: true };
  } catch (err) {
    console.error("Erase failed:", err);
    return { ok: false, error: err.message };
  }
});





// ============================
// ✍️ WRITE MARKDOWN (Forgejo)
// ============================

///copie sans correction a revoir

ipcMain.handle("write-markdown", async (event, args) => {
  try {
    const { fileName, content, branch = "main" } = args;

    const response = await fetch(`${FORGEJO_BASE}/api/forgejo/create-file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book: fileName,
        content,
        branch,
      }),
    });

    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }

    const result = await response.json();

    // 🔄 Optionnel : refresh du cache local
    await fetchBooksFromRepo().catch(console.error);

    return { ok: true, result };

  } catch (err) {
    console.error("❌ write-markdown error:", err);
    return { ok: false, error: err.message };
  }
});



// ============================
// CREATE BOOK
// ============================

// ⚠️ ACTUEL = LOCAL FS → incohérent avec Forgejo
ipcMain.handle("create-or-update-book", async () => {
  throw new Error("Must be implemented via Forgejo API");
});







// ============================
// APP STARTUP
// ============================

app.whenReady().then(async () => {
  // Créer le dossier si nécessaire
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  // Créer la fenêtre
  createWindow();
  console.log("Electron ready");

  //  SCANNER AU DÉMARRAGE
  // await scanAndStoreBooks();
});

// ============================
// BUG FIX MACOS
// ============================
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (win === null) createWindow(); // FIX: win != mainWindow
});


// ============================
// Ouvrir un fichier Sound
// ============================

ipcMain.handle("open-dialog", async () => {
  const win = BrowserWindow.getFocusedWindow();

  const result = await dialog.showOpenDialog(win, {
    title: "Choisir un fichier audio",
    filters: [
      { name: "Audio", extensions: ["wav", "mp3", "m4a", "ogg", "flac"] },
    ],
    properties: ["openFile"],
  });

  if (result.canceled) return null;

  return result.filePaths;
});

//######## AUDIO FILE HANDLING ############

// -------- FILE Sound OPEN ------------
ipcMain.handle("open-audio-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Audio", extensions: ["wav", "mp3"] }],
    properties: ["openFile"],
  });

  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
  //console.log("filePaths:", filePaths[0]);
  // console.log("filePath:", filePath);

  // Read Sound file as Buffer
  const buffer = fs.readFileSync(filePath); ////////////////////////////////

  // Convert SOund buffer to ArrayBuffer for IPC
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  return { buffer: arrayBuffer, path: filePath };
});

// -------- SAVE AUDIO FILE ----------
ipcMain.handle("save-audio-file", async (event, { fileName, data }) => {
  const filePathtest = path.join(__dirname, "public", "audio", fileName);
  console.log(fileName);
  console.log(filePathtest);
  try {
    const filePath = path.join(BASE_PATH, "public", "audio", fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(filePath, Buffer.from(data));

    console.log("✅ Audio saved:", filePath);
    return { ok: true, path: filePath };
  } catch (err) {
    console.error("❌ Error saving audio:", err);
    return { ok: false, error: err.message };
  }
});





//// ============================
//  pas present dans main.js, à intégrer si besoin
// ============================








//  Exécuter le Python
ipcMain.handle("run-python-stt", (event, config) => {
  const exe = path.join(__dirname, "dist", "speech_to_text8Elec.exe");

  console.log("🔍 Launching Python EXE:", exe);

  if (!fs.existsSync(exe)) {
    console.error("❌ Python EXE NOT FOUND:", exe);
    return;
  }

  // Ajouter automatiquement un fichier de sortie
  const outputFileName = "transcription_" + Date.now() + ".md";
  config.output_path = path.join(OUTPUT_DIR, outputFileName);

  console.log("📄 Output file:", config.output_path);

  const child = spawn(exe, [JSON.stringify(config)], {
    detached: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (data) => {
    console.log("[PY STDOUT]", data.toString());
    event.sender.send("python-output", data.toString());
  });

  child.stderr.on("data", (data) => {
    console.log("[PY ERROR]", data.toString());
    event.sender.send("python-error", data.toString());
  });

  child.on("close", (code) => {
    console.log("Python exited with code", code);
    event.sender.send("python-exit", {
      code,
      output_path: config.output_path,
    });
  });
});

