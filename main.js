// =======================================================
// 🧱 CORE SETUP
// =======================================================
import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";
import { dirname } from "path";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import Store from "electron-store";
import { spawn } from "child_process";
import matter from "gray-matter";
import { data } from "react-router-dom";

// =======================================================
// 📁 PATHS & GLOBAL CONFIG
// =======================================================

// 🔹 Node path utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔹 Electron store (persistant)
const store = new Store();

// 🔹 Base path (DEV vs PROD)
const BASE_PATH = app.isPackaged ? process.resourcesPath : __dirname;

// 🔹 Output folder (audio / python)
const OUTPUT_DIR = path.join(BASE_PATH, "output");

// 🔹 Cache TTL (⚠️ inutilisé actuellement → voir note plus bas)
const CACHE_TTL = 60 * 60 * 1000;

// 🔹 Forgejo config centralisée
const FORGEJO = {
  base: process.env.FORGEJO_URL || "http://localhost:3000",
  repo: `${process.env.FORGEJO_USER}/${process.env.FORGEJO_REPO}`,
  token: process.env.FORGEJO_TOKEN,
};

// =======================================================
// 🪟 WINDOW
// =======================================================

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(BASE_PATH, "favicon.ico"),
    webPreferences: {
      preload: path.join(BASE_PATH, "preload.js"),
      contextIsolation: true,
      sandbox: false,
    },
  });

  win.loadURL("http://localhost:5173"); // ⚠️ DEV ONLY
  win.webContents.openDevTools();
  win.setMenuBarVisibility(false);

  // 🎤 autorisation micro
  win.webContents.session.setPermissionRequestHandler(
    (_, permission, cb, details) => {
      const url = new URL(details.requestingUrl);

      if (url.origin === "http://localhost:5173" && permission === "media") {
        return cb(details.mediaTypes?.includes("audio"));
      }

      cb(false);
    },
  );
}

// =======================================================
// 📚 BOOKS LOGIC (CACHE + FETCH)
// =======================================================

async function getBooks(force = false) {
  const cached = store.get("books", []);

  // ✔️ logique simple (pas de TTL pour l’instant)
  if (!force && cached.length > 0) {
    console.log("📦 Using cache");
    return cached;
  }

  return refreshBooks();
}

async function refreshBooks() {
  console.log("🌐 Fetching books...");

  try {
    const res = await fetch(
      `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/`,
    );
    if (!res.ok) throw new Error(res.status);

    const data = await res.json();

    const mdFiles = data.filter(
      (f) => f.type === "file" && f.name.endsWith(".md"),
    );

    const results = [];

    for (const file of mdFiles) {
      try {
        const r = await fetch(file.download_url);
        const raw = await r.text();

        const { data: meta } = matter(raw);

        results.push({
          id: file.sha || file.path,
          name: file.name,
          url: file.download_url, ////////// est-ce que tu utilises cette URL dans tes composants ? sinon on peut la retirer du store pour alléger

          title: meta.title || file.name.replace(".md", ""),
          link: meta.link || "",
          status: meta.status || "unknown",
          description: meta.description || "",
          type: meta.type || "",
          author: meta.text_author || "",
        });
      } catch {
        // ignore file error
      }
    }

    store.set("books", results);
    store.set("books_last_scan", new Date().toISOString());

    return results;
  } catch (err) {
    console.error("❌ Fetch failed:", err);

    return store.get("books", []);
  }
}

// =======================================================
// 📄 MARKDOWN
// =======================================================

ipcMain.handle("read-markdown", async (_, { url, raw = false }) => {
  console.log("📥 read-markdown called with URL:", url, " | raw:", raw);
  const res = await fetch(url);
  const text = await res.text();

  return raw ? text : text.replace(/^---[\s\S]+?---\s*/, "");
});

// =======================================================
// ✍️ WRITE (Forgejo)
// =======================================================

ipcMain.handle("write-markdown", async (event, data) => {
  console.log("📥 Raw Payload received in Main:", data);
  // Déstructuration sécurisée
  console.log(`\n--- 📝 START WRITE-MARKDOWN ---`);
  console.log(`📍 File: ${data.fileName} | Branch: ${data.branch || "main"}`);
  const { fileName, content, branch = "main" } = data;
  if (!fileName || !content) {
    console.error("❌ Missing required fields: fileName or content is empty");
    return { ok: false, error: "Missing fileName or content" };
  }
  console.log(`\n--- 📝 START WRITE-MARKDOWN ---`);
  console.log(`📍 File: ${fileName} | Branch: ${branch}`);

  try {
    // 1. Get current file SHA
    const metaUrl = `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/${fileName}?ref=${branch}`;
    console.log(`🔗 Step 1: Fetching metadata from: ${metaUrl}`);

    const metaRes = await fetch(metaUrl, {
      headers: {
        Authorization: `token ${FORGEJO.token}`,
      },
    });

    if (!metaRes.ok) {
      const errText = await metaRes.text();
      console.error("❌ Step 1 Failed (Metadata):", metaRes.status, errText);
      throw new Error(`Metadata fetch failed: ${metaRes.status} - ${errText}`);
    }

    const fileData = await metaRes.json();
    console.log("✅ Step 1 Success: Received SHA:", fileData.sha);

    // 2. Encode content
    console.log("⚙️ Step 2: Encoding content to Base64...");
    const encoded = Buffer.from(content, "utf-8").toString("base64");
    console.log("✅ Step 2 Success: Content encoded.");

    // 3. Update file
    const putUrl = `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/${fileName}`;
    console.log(`🔗 Step 3: Sending PUT request to: ${putUrl}`);

    const response = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${FORGEJO.token}`,
      },
      body: JSON.stringify({
        content: encoded,
        message: `update ${fileName} (${branch})`,
        sha: fileData.sha, // Utilise le SHA récupéré à l'étape 1
        branch: branch,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("❌ Step 3 Failed (PUT):", response.status, errBody);
      throw new Error(`Update failed: ${response.status} - ${errBody}`);
    }

    const result = await response.json();
    console.log("✅ Step 3 Success: File updated on Forgejo!");
    console.log(`--- 🏁 END WRITE-MARKDOWN (OK) ---\n`);

    return { ok: true, result };
  } catch (err) {
    console.error("💥 CRITICAL ERROR in write-markdown:");
    console.error(err);
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("write-markdown-Create", async (event, data) => {
  const { fileName, content, branch = "main" } = data;
  if (!fileName || !content)
    return { ok: false, error: "Missing fileName or content" };

  try {
    // 1. CHECK : Est-ce que le fichier existe ?
    let currentSha = null;
    const metaUrl = `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/${fileName}?ref=${branch}`;

    console.log(`🔍 Vérification de l'existence : ${fileName} sur ${branch}`);

    const metaRes = await fetch(metaUrl, {
      headers: { Authorization: `token ${FORGEJO.token}` },
    });

    if (metaRes.ok) {
      const fileData = await metaRes.json();
      currentSha = fileData.sha;
      console.log(
        `✅ EXISTE : SHA trouvé (${currentSha}). On passe en mode UPDATE.`,
      );
    } else if (metaRes.status === 404) {
      console.log(`ℹ️ INEXISTANT (404). On passe en mode CRÉATION.`);
    } else {
      const errText = await metaRes.text();
      throw new Error(`Erreur check existence: ${metaRes.status} - ${errText}`);
    }

    // 2. PRÉPARATION DU PAYLOAD
    const encoded = Buffer.from(content, "utf-8").toString("base64");
    const putUrl = `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/${fileName}`;

    const payload = {
      content: encoded,
      message: currentSha ? `🛠 update ${fileName}` : `✨ create ${fileName}`,
      branch: branch,
    };

    // La clé du succès : on n'ajoute le SHA que si le fichier existe
    let response;

    if (currentSha) {
      // UPDATE
      response = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${FORGEJO.token}`,
        },
        body: JSON.stringify({
          content: encoded,
          message: `🛠 update ${fileName}`,
          sha: currentSha,
          branch,
        }),
      });
    } else {
      // CREATE
      response = await fetch(putUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${FORGEJO.token}`,
        },
        body: JSON.stringify({
          content: encoded,
          message: `✨ create ${fileName}`,
          branch,
        }),
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error("❌ Échec du PUT Forgejo:", errBody);
      throw new Error(`Forgejo error ${response.status}: ${errBody}`);
    }

    const result = await response.json();
    console.log(`🚀 Opération réussie pour ${fileName}`);
    return { ok: true, result };
  } catch (err) {
    console.error("💥 Erreur dans write-markdown:", err.message);
    return { ok: false, error: err.message };
  }
});
// =======================================================
// 🎧 AUDIO
// =======================================================

ipcMain.handle("open-audio-dialog", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Audio", extensions: ["wav", "mp3"] }],
    properties: ["openFile"],
  });

  if (canceled || !filePaths.length) return null;

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
// 🐍 PYTHON
// =======================================================

ipcMain.handle("run-python-stt", (event, config) => {
  const exe = path.join(BASE_PATH, "dist", "speech_to_text8Elec.exe");

  if (!fs.existsSync(exe)) {
    console.error("❌ EXE not found");
    return;
  }

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
    event.sender.send("python-exit", {
      code,
      output_path: config.output_path,
    }),
  );
});


ipcMain.handle("save-audio-file", async (_, { fileName, data }) => {
  try {
    // 1. Ouvrir la fenêtre "Enregistrer sous"
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Exporter le fichier audio nettoyé',
       defaultPath: path.join(app.getPath('downloads'), fileName),
      filters: [
        { name: 'Audio Files', extensions: ['wav'] }
      ]
    });

    // 2. Si l'utilisateur a cliqué sur annuler
    if (canceled || !filePath) {
      return { ok: false, error: "Sauvegarde annulée" };
    }

    // 3. Écrire le fichier au chemin choisi
    await fs.promises.writeFile(filePath, Buffer.from(data));
    
    return { ok: true, path: filePath };
  } catch (err) {
    console.error("❌ Error saving audio file:", err);
    return { ok: false, error: err.message };
  }
});

// =======================================================
// 🌿 BRANCHES (Forgejo)
// =======================================================

ipcMain.handle("get-file-branches", async (_, { fileName }) => {
  try {
    const res = await fetch(
      `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/branches`,
      {
        headers: { Authorization: `token ${FORGEJO.token}` },
      },
    );

    const branches = await res.json();

    const validBranches = [];

    for (const b of branches) {
      const check = await fetch(
        `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/contents/${fileName}?ref=${b.name}`,
        {
          headers: { Authorization: `token ${FORGEJO.token}` },
        },
      );

      if (check.ok) validBranches.push(b.name);
    }

    return validBranches;
  } catch (err) {
    console.error("❌ Branch error:", err);
    return [];
  }
});



ipcMain.handle("get-all-branches", async () => {
  try {
    const res = await fetch(
      `${FORGEJO.base}/api/v1/repos/${FORGEJO.repo}/branches`,
      {
        headers: {
          Authorization: `token ${FORGEJO.token}`,
        },
      }
    );

    const branches = await res.json();

    return branches.map((b) => b.name);
  } catch (err) {
    console.error("❌ Branch fetch error:", err);
    return [];
  }
});


// =======================================================
// 🔌 IPC BOOKS
// =======================================================

ipcMain.handle("read-books", () => getBooks(false));
ipcMain.handle("rescan-books", () => getBooks(true));

// =======================================================
// 🚀 APP LIFECYCLE
// =======================================================

app.whenReady().then(async () => {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  createWindow();

  // ⚠️ preload cache (non bloquant)
  getBooks(false);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
