// =======================================================
// 🧱 CORE SETUP
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
// 📁 PATHS & CONFIG
// =======================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const store = new Store();

const CACHE_TTL = 60 * 60 * 1000;
// ⚠️ En prod Electron → __dirname faux → utiliser resourcesPath
const BASE_PATH = app.isPackaged ? process.resourcesPath : __dirname;
const OUTPUT_DIR = path.join(BASE_PATH, "output");

// Centralisation de la config Forgejo
const FORGEJO_CONFIG = {
  base: process.env.FORGEJO_URL || "http://localhost:3000",
  repo: `${process.env.FORGEJO_USER}/${process.env.FORGEJO_REPO}`,
  token: process.env.FORGEJO_TOKEN,
};

let win = null;

// =======================================================
// 📚 DATA LOGIC (Forgejo & Cache)
// =======================================================

/**
 * Logique unique pour récupérer les livres.
 * @param {boolean} force - Si true, ignore le cache et force le scan Forgejo.
 */
async function getBooks(force = false) {
  const cached = store.get("books", []);
  const lastScan = store.get("books_last_scan");
 // console.log(store.get("books"));
  console.log(store.path);
  console.log(lastScan);
  



  // On renvoie le cache si : pas de force refresh ET cache pas expiré ET cache non vide
  if (!force && cached.length > 0) {
    console.log("📦 Serving from cache");
    return cached;
  }

  return await refreshBooks();
}

/**
 * Scan réel du repo Forgejo
 */
async function refreshBooks() {
  console.log("🌐 Fetching fresh data from Forgejo...");
  try {
    const response = await fetch(
      `${FORGEJO_CONFIG.base}/api/v1/repos/${FORGEJO_CONFIG.repo}/contents/`,
    );

    if (!response.ok) throw new Error("Forgejo API error: " + response.status);

    const data = await response.json();
    const mdFiles = data.filter(
      (f) => f.type === "file" && f.name.endsWith(".md"),
    );

    const results = [];
    const LIMIT = 5; // Batching pour ne pas saturer le réseau

    for (let i = 0; i < mdFiles.length; i += LIMIT) {
      const chunk = mdFiles.slice(i, i + LIMIT);
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          try {
            const res = await fetch(file.download_url);
            const raw = await res.text();
            const { data: meta } = matter(raw);

            return {
              id: file.sha || file.path,
              name: file.name,
              url: file.download_url,
              title: meta.title || file.name.replace(".md", ""),
              link: meta.link || "",
              status: meta.status || "unknown",
              description: meta.description || "",
              type: meta.type || "",
              author: meta.text_author || "",
            };
          } catch (err) {
            return null;
          }
        }),
      );
      results.push(...chunkResults.filter(Boolean));
    }

    store.set("books", results);
    store.set("books_last_scan", new Date().toISOString());
    return results;
  } catch (err) {
    console.error("❌ Fetch failed", err);
    return store.get("books", []); // Fallback sur le cache si le réseau plante
  }

}

// =======================================================
// 🔌 IPC HANDLERS
// =======================================================

// --- BOOKS ---
ipcMain.handle("read-books", () => getBooks(false));
ipcMain.handle("rescan-books", () => getBooks(true));

// --- MARKDOWN (Fusionné) ---
// Utilisation : ipcRenderer.invoke('read-markdown', { url: '...', raw: true })
ipcMain.handle("read-markdown", async (event, { url, raw = false }) => {
  try {
    const response = await fetch(url);
    const content = await response.text();
    // Si raw est true, on garde le frontmatter (pour l'édition), sinon on l'enlève
    return raw ? content : content.replace(/^---[\s\S]+?---\s*/, "");
  } catch (err) {
    console.error("Markdown read error:", err);
    throw err;
  }
});

// --- WRITE ---
ipcMain.handle(
  "write-markdown",
  async (event, { fileName, content, branch = "main" }) => {
    try {
      const encoded = Buffer.from(content, "utf-8").toString("base64");

      const response = await fetch(
        `${FORGEJO_CONFIG.base}/api/v1/repos/${FORGEJO_CONFIG.repo}/contents/${fileName}`,
        {
          method: "PUT", // ⚠️ important
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${FORGEJO_CONFIG.token}`,
          },
          body: JSON.stringify({
            content: encoded,
            message: `update ${fileName}`,
            sha: fileData.sha, // 🔥 REQUIRED
            branch,
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      return { ok: true };
    } catch (err) {
      console.error("❌ Write failed:", err);
      return { ok: false, error: err.message };
    }
  },
);

// --- AUDIO ---
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

// --- PYTHON ---
ipcMain.handle("run-python-stt", (event, config) => {
  const exe = path.join(BASE_PATH, "dist", "speech_to_text8Elec.exe");
  if (!fs.existsSync(exe)) return console.error("EXE not found at", exe);

  config.output_path = path.join(OUTPUT_DIR, `transcription_${Date.now()}.md`);

  const child = spawn(exe, [JSON.stringify(config)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (d) =>
    event.sender.send("python-output", d.toString()),
  );
  child.stderr.on("data", (d) =>
    event.sender.send("python-error", d.toString()),
  );
  child.on("close", (code) =>
    event.sender.send("python-exit", { code, output_path: config.output_path }),
  );
});

// =======================================================
// 🪟 WINDOW & LIFECYCLE
// =======================================================

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
  // ⚠️ DEV ONLY → à remplacer en prod par un loadFile ou loadURL vers le build
  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools();
  win.setMenuBarVisibility(false);

  // 🎤 Permission micro
  win.webContents.session.setPermissionRequestHandler(
    (wc, permission, cb, details) => {
      const url = new URL(details.requestingUrl);
      if (url.origin === "http://localhost:5173" && permission === "media") {
        return cb(details.mediaTypes?.includes("audio"));
      }
      cb(false);
    },
  );
}

app.whenReady().then(async () => {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  createWindow();
  getBooks(false); // Initialisation du cache en arrière-plan
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

///////////////////
//A travailler
/////////////////

ipcMain.handle("get-file-branches", async (event, { fileName }) => {
  try {
    // 1. récupérer toutes les branches
    const branchesRes = await fetch(
      `${FORGEJO_CONFIG.base}/api/v1/repos/${FORGEJO_CONFIG.repo}/branches`,
      {
        headers: {
          Authorization: `token ${FORGEJO_CONFIG.token}`,
        },
      }
    );

    const branches = await branchesRes.json();

    // 2. vérifier présence du fichier
    const results = [];

    for (const branch of branches) {
      try {
        const res = await fetch(
          `${FORGEJO_CONFIG.base}/api/v1/repos/${FORGEJO_CONFIG.repo}/contents/${fileName}?ref=${branch.name}`,
          {
            headers: {
              Authorization: `token ${FORGEJO_CONFIG.token}`,
            },
          }
        );

        if (res.ok) {
          results.push(branch.name);
        }
      } catch {
        // ignore erreurs
      }
    }

    return results;
  } catch (err) {
    console.error("❌ Branch fetch error:", err);
    return [];
  }
});


