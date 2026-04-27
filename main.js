// =======================================================
// 🧱 CORE SETUP (Node / Electron base)
// =======================================================
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import { dirname } from "path";
import Store from "electron-store";
import { spawn } from "child_process";
import { app, BrowserWindow, shell, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";

// =======================================================
// 📁 PATHS / ENV CONFIG / Consts
// =======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const store = new Store();

// ⚠️ En prod Electron → __dirname faux → utiliser resourcesPath
const BASE_PATH = app.isPackaged ? process.resourcesPath : __dirname;
const OUTPUT_DIR = path.join(BASE_PATH, "output");

// ⚠️ utilisé pour API frontend (à clarifier plus tard)
const NEXT_PUBLIC_ASSETS_URL = process.env.Visual_Data_Source_URL;

// 🔐 Forgejo config (⚠️ sera déplacé vers API plus tard)
const USER = process.env.FORGEJO_USER;
const FORGEJO_REPO = process.env.FORGEJO_REPO;
const FORGEJO_TOKEN = process.env.FORGEJO_TOKEN;
const FORGEJO_BASE = process.env.FORGEJO_URL || "http://localhost:3000";

const REPO = `${USER}/${FORGEJO_REPO}`;

// =======================================================
// 🪟 WINDOW MANAGEMENT
// =======================================================

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(BASE_PATH, "favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(BASE_PATH, "preload.js"),
      sandbox: false,
    },
  });

  console.log("BrowserWindow created");

  // ⚠️ DEV ONLY → à remplacer en prod
  win.loadURL("http://localhost:5173");

  win.webContents.openDevTools();
  win.setMenuBarVisibility(true);

  // 🎤 Permission micro (DEV uniquement pour l'instant)
  win.webContents.session.setPermissionRequestHandler(
    (wc, permission, cb, details) => {
      const url = new URL(details.requestingUrl);

      if (url.origin === "http://localhost:5173") {
        if (permission === "media") {
          if (details.mediaTypes?.includes("audio")) {
            return cb(true);
          }
        }
      }
      cb(false);
    },
  );
}

// =======================================================
// 📚 FORGEJO → INDEXATION (SOURCE → STORE)
// =======================================================

/*
🧠 LOGIQUE ACTUELLE :

Forgejo = source de vérité
↓
scan repo
↓
store = cache (listing books)
↓
UI lit le store
↓
contenu chargé à la demande via URL
*/

async function fetchBooksFromRepo() {
  try {
    const response = await fetch(
      `${FORGEJO_BASE}/api/v1/repos/${REPO}/contents/`,
      {
        headers: {
          Authorization: `token ${FORGEJO_TOKEN}`, // ⚠️ À migrer vers API
        },
      },
    );

    if (!response.ok) {
      throw new Error("Forgejo API error: " + response.status);
    }

    const data = await response.json();

    // SAFE GUARD
    if (!Array.isArray(data)) {
      console.error("❌ Expected array, got:", data);
      return [];
    }

    const books = data
      .filter((file) => file.type === "file")
      .map((file) => ({
        name: file.name,
        path: file.path,
        status: file.status,
        url: file.download_url,
        description: file.description || "",

      }));

    store.set("books", books);
    store.set("books_last_scan", new Date().toISOString());

    return books;
  } catch (err) {
    console.error("❌ Forgejo fetch error:", err);

    // fallback cache
    return store.get("books", []);
  }
}

// =======================================================
// 🔌 IPC — BOOKS (STORE ACCESS)
// =======================================================

// 📥 UI → récupère le cache local
ipcMain.handle("read-books-json", () => {
  return store.get("books", []);
});

// 🔄 refresh manuel depuis UI
ipcMain.handle("rescan-books", async () => {
  return await fetchBooksFromRepo();
});

// =======================================================
// 📄 IPC — MARKDOWN (LECTURE)
// =======================================================

// ✔️ Lecture via URL Forgejo
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

// ✔️ version édition (sans strip frontmatter)
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

// =======================================================
// ✍️ WRITE MARKDOWN (API → Forgejo)
// =======================================================

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

    // 🔄 refresh cache
    await fetchBooksFromRepo().catch(console.error);

    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// =======================================================
// 🎧 AUDIO HANDLING
// =======================================================

ipcMain.handle("open-audio-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Audio", extensions: ["wav", "mp3"] }],
    properties: ["openFile"],
  });

  if (canceled || filePaths.length === 0) return null;

  const buffer = fs.readFileSync(filePaths[0]);

  return {
    buffer: buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ),
    path: filePaths[0],
  };
});

// =======================================================
// 🐍 PYTHON EXECUTION
// =======================================================

ipcMain.handle("run-python-stt", (event, config) => {
  const exe = path.join(__dirname, "dist", "speech_to_text8Elec.exe");

  if (!fs.existsSync(exe)) return;

  const outputFileName = "transcription_" + Date.now() + ".md";
  config.output_path = path.join(OUTPUT_DIR, outputFileName);

  const child = spawn(exe, [JSON.stringify(config)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    event.sender.send("python-output", data.toString());
  });

  child.stderr.on("data", (data) => {
    event.sender.send("python-error", data.toString());
  });

  child.on("close", (code) => {
    event.sender.send("python-exit", {
      code,
      output_path: config.output_path,
    });
  });
});

// =======================================================
// 🚀 APP LIFECYCLE
// =======================================================

app.whenReady().then(async () => {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Electron ready");

  // 🔥 IMPORTANT : initial fetch
  await fetchBooksFromRepo().catch(console.error);

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (win === null) createWindow();
});
