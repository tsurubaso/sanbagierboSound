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
import matter from "gray-matter";

// =======================================================
// 📁 PATHS / ENV CONFIG / Consts
// =======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const store = new Store();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
let isRefreshing = false;

async function fetchBooksFromForgejo() {
  const cached = store.get("books", []);
  const lastScan = store.get("books_last_scan");

  const CACHE_TTL = 5 * 60 * 1000; // 5 min

  // ✅ Use cache if still fresh
  if (
    cached.length > 0 &&
    lastScan &&
    Date.now() - new Date(lastScan).getTime() < CACHE_TTL
  ) {
    console.log("📦 Using cached books");
    return cached;
  }

  console.log("🌐 Fetching books from Forgejo...");

  try {
    const response = await fetch(
      `${FORGEJO_BASE}/api/v1/repos/${REPO}/contents/`
    );

    if (!response.ok) {
      throw new Error("Forgejo API error: " + response.status);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("❌ Expected array, got:", data);
      return cached;
    }

    const LIMIT = 5;
    const results = [];

    for (let i = 0; i < data.length; i += LIMIT) {
      const chunk = data.slice(i, i + LIMIT);

      const chunkResults = await Promise.all(
        chunk
          .filter((f) => f.type === "file" && f.name.endsWith(".md"))
          .map(async (file) => {
            try {
              const res = await fetch(file.download_url);
              const raw = await res.text();
              const { data: meta } = matter(raw);

              return {
                id: file.sha || file.path,
                name: file.name,
                path: file.path,
                url: file.download_url,
                title: meta.title || file.name.replace(".md", ""),
                status: meta.status || "unknown",
                description: meta.description || "",
                type: meta.type || "",
                author: meta.text_author || "",
              };
            } catch (err) {
              console.error("Parse error:", file.name);
              return null;
            }
          })
      );

      results.push(...chunkResults.filter(Boolean));
    }

    store.set("books", results);
    store.set("books_last_scan", new Date().toISOString());

    console.log(`✅ ${results.length} books loaded`);

    return results;

  } catch (err) {
    console.error("❌ Fetch failed, using cache", err);
    return cached;
  }
}

async function fetchBooksFromRepo() {
  const lastScan = store.get("books_last_scan");
  const cached = store.get("books", []);

  const isValid =
    lastScan && Date.now() - new Date(lastScan).getTime() < CACHE_TTL;

  if (isValid) {
    console.log("📦 Using cached books");

    // ✅ SAFE background refresh (NO recursion)
    if (!isRefreshing) {
      isRefreshing = true;

      fetchBooksFromForgejo().finally(() => {
        isRefreshing = false;
      });
    }

    return cached;
  }

  // ❗ ONLY HERE we fetch
  return await fetchBooksFromForgejo();
}

// =======================================================
// 🔌 IPC — BOOKS (STORE ACCESS)
// =======================================================

// 📥 UI → récupère le cache local
ipcMain.handle("read-books", async () => {
  const cached = store.get("books", []);

  // 👉 PREMIER LANCEMENT
  if (!cached || cached.length === 0) {
    console.log("🆕 First load → fetching");

    const fresh = await fetchBooksFromRepo();
    return fresh;
  }

  // 👉 CAS NORMAL
  if (!isRefreshing) {
    fetchBooksFromRepo().catch(console.error);
  } // refresh background

  return cached;
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

  const books = await fetchBooksFromRepo().catch(console.error);
  console.log(`Fetched ${books.length} books from Forgejo`);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (win === null) createWindow();
});
