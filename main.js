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
















  

  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools();

  win.webContents.session.setPermissionRequestHandler((wc, permission, cb) => {
    if (permission === "media") return cb(true);
    cb(false);
  });
}

// ❌ DOUBLE INIT → supprimé
// app.whenReady().then(createWindow);

// ============================
// 📚 FORGEJO API (NEW SOURCE)
// ============================

// FIX: centraliser config
const FORGEJO_BASE = process.env.FORGEJO_URL || "http://localhost:3000";
const FORGEJO_TOKEN = process.env.FORGEJO_TOKEN;
const REPO = "USER/REPO"; // TODO: à externaliser

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
        url: file.download_url, // FIX: standardiser clé
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
// ❌ ANCIEN SYSTÈME LOCAL
// ============================

/*
async function scanAndStoreBooks() {
  const booksPath = path.join(__dirname, "public", "books");
  const books = await scanBooksFolder(booksPath);
  store.set("books", books);
  return books;
}
*/

// ============================
// IPC BOOKS
// ============================

// FIX: utiliser Forgejo API
ipcMain.handle("read-books-json", async () => {
  return await fetchBooksFromRepo();
});

// FIX: idem
ipcMain.handle("rescan-books", async () => {
  return await fetchBooksFromRepo();
});

// ============================
// 📄 READ MARKDOWN (Forgejo)
// ============================

// FIX: lire via URL au lieu de fs
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

// ============================
// ✍️ WRITE MARKDOWN (Forgejo)
// ============================

// ⚠️ TODO: remplacer par API commit Forgejo
ipcMain.handle("write-markdown", async () => {
  throw new Error("Not implemented with Forgejo API yet");
});

/*
FIX FUTUR:

POST /repos/:owner/:repo/contents/:path

body:
{
  content: base64,
  message: "update file"
}
*/

// ============================
// ❌ GIT OPS → À SUPPRIMER
// ============================

/*
const gitParent = simpleGit(...)

ipcMain.handle("github-pull", ...)
ipcMain.handle("github-push", ...)
ipcMain.handle("github-sync", ...)
*/

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

  //await fetchBooksFromRepo();/////////////////////////faut checker ici commente en attendant
  createWindow();
  console.log("Electron ready");
});

// ============================
// BUG FIX MACOS
// ============================

app.on("activate", () => {
  if (win === null) createWindow(); // FIX: win != mainWindow
});
