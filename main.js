import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname } from "path";

import Store from "electron-store";

import { scanBooksFolder } from "./api/bookScanner.js";
//import simpleGit from "simple-git";// trouver forgejo
import { spawn } from "child_process";

import { app, BrowserWindow, shell, dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


FORGEJO_USER=tsurubaso
FORGEJO_REPO=bibliotheque
FORGEJO_TOKEN=${FORGEJO_TOKEN}

const store = new Store();

const OUTPUT_DIR = path.join(__dirname, "output");

// Créer le dossier si nécessaire
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

//  DÉCLARER mainWindow EN GLOBAL
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "favicon.ico"), // ou .png selon OS
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: false, // !!!!!!!!!!!!!!!!!!//,
    },
  });
  console.log("BrowserWindow created");

  win.loadURL("http://localhost:5173"); // Vite or React dev server
  win.webContents.openDevTools(); // débugger
  win.setMenuBarVisibility(true);

  // >>> Indispensable pour autoriser micro
  win.webContents.session.setPermissionRequestHandler((wc, permission, cb) => {
    if (permission === "media") {
      return cb(true); // autorise micro
    }
    cb(false);
  });
}

app.whenReady().then(createWindow);

//######## MD FILE HANDLING ############

//  SCANNER LES LIVRES sur Forgejo
async function fetchBooksFromRepo() {
  const response = await fetch(
    "http://localhost:3000/api/v1/repos/USER/REPO/contents/public/books",
    {
      headers: {
        Authorization: "token YOUR_TOKEN"
      }
    }
  );

  const data = await response.json();

  const books = data.map(file => ({
    name: file.name,
    path: file.path,
    download_url: file.download_url
  }));

  store.set("books", books);
  return books;
}

/  SCANNER LES LIVRES AU DÉMARRAGE
async function scanAndStoreBooks() {
  const booksPath = path.join(__dirname, "public", "books");
  console.log(" Scanning books folder:", booksPath);

  const books = await scanBooksFolder(booksPath);

  console.log(` Found ${books.length} books`);

  // Stocker dans electron-store
  store.set("books", books);
  store.set("books_last_scan", new Date().toISOString());

  return books;
}

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

// ========================
// IPC HANDLERS
// ========================

//  IPC HANDLER : Récupérer les livres depuis le store
ipcMain.handle("read-books-json", async () => {
  try {
    const books = store.get("books", []);

    // Si vide, rescanner
    if (books.length === 0) {
      return await scanAndStoreBooks();
    }

    return books;
  } catch (error) {
    console.error("Erreur lors de la lecture des livres:", error);
    throw error;
  }
});

//  IPC HANDLER : Forcer un rescan
ipcMain.handle("rescan-books", async () => {
  return await scanAndStoreBooks();
});

// IPC pour lire un fichier Markdown
ipcMain.handle("read-markdown", async (event, link) => {
  try {
    const filePath = path.join(__dirname, "public", "books", `${link}.md`);
    const content = fs.readFileSync(filePath, "utf8");
    return content.replace(/^---[\s\S]+?---\s*/, ""); // strip frontmatter
  } catch (err) {
    console.error("Erreur lecture Markdown:", err);
    throw err;
  }
});

// IPC pour lire un fichier Markdown
ipcMain.handle("read-markdown-editing", async (event, link) => {
  try {
    const filePath = path.join(__dirname, "public", "books", `${link}.md`);
    const content = fs.readFileSync(filePath, "utf8");
    return content; // NO strip frontmatter
  } catch (err) {
    console.error("Erreur lecture Markdown:", err);
    throw err;
  }
});

ipcMain.handle("write-markdown", async (event, args) => {
  try {
    const filePath = path.join(
      __dirname,
      "public",
      "books",
      `${args.filePath}.md`
    );

    await fs.promises.writeFile(filePath, args.content, "utf8");

    return true;
  } catch (err) {
    console.error("Erreur écriture Markdown:", err);
    throw err;
  }
});

// =======================================================
// GITHUB DEVICE FLOW / SESSION
// =======================================================

// Lance login GitHub
ipcMain.handle("github-login", async () => {
  const client_id = process.env.GITHUB_CLIENT_ID;

  try {
    // 1. Demander un device code
    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("scope", "read:user repo");

    const deviceResponse = await fetch("https://github.com/login/device/code", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params,
    });

    const deviceData = await deviceResponse.json();

    if (!deviceData.user_code) {
      throw new Error("Invalid device response: " + JSON.stringify(deviceData));
    }

    // Ouvrir le navigateur
    await shell.openExternal(deviceData.verification_uri);

    // 3. Retourner le code à afficher à l'utilisateur
    return {
      user_code: deviceData.user_code,
      device_code: deviceData.device_code,
      interval: deviceData.interval,
    };
  } catch (err) {
    console.error("Device flow error:", err);
    throw err;
  }
});

// ✅ Polling pour vérifier si l'utilisateur a validé
ipcMain.handle("github-poll-token", async (event, deviceCode) => {
  const client_id = process.env.GITHUB_CLIENT_ID;

  try {
    const params = new URLSearchParams();
    params.append("client_id", client_id);
    params.append("device_code", deviceCode);
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:device_code");

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params,
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      store.set("github_token", tokenData.access_token);
      return { success: true, token: tokenData.access_token };
    }

    // Encore en attente
    return { success: false, error: tokenData.error };
  } catch (err) {
    console.error("Token poll error:", err);
    return { success: false, error: err.message };
  }
});

// Récupère la session si présente
ipcMain.handle("github-session", () => {
  return store.get("github_token", null);
});

// Logout
ipcMain.handle("github-logout", () => {
  store.delete("github_token");
  return true;
});

// =======================================================
// GITHUB PROFILE
// =======================================================

ipcMain.handle("github-profile", async () => {
  const token = store.get("github_token");
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error("GitHub API error: " + response.status);
    }

    const profile = await response.json();

    return {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
    };
  } catch (err) {
    console.error("GitHub profile error:", err);
    throw err;
  }
});

// =======================================================
// GIT OPS (pull / push / sync)
// =======================================================

const WORKSPACE = process.cwd(); // dossier réel, pas asar !
const SUBMODULE = path.join(WORKSPACE, "public/books");

const gitParent = simpleGit(WORKSPACE);
const gitSub = simpleGit(SUBMODULE);

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
  }
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
//await delay(4000);

// ========================
// APP STARTUP
// ========================

app.whenReady().then(async () => {
  console.log("Electron app ready");

  //  SCANNER AU DÉMARRAGE
  await scanAndStoreBooks();

  // Créer la fenêtre
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

//  Pour macOS - recréer la fenêtre si fermée
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

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

ipcMain.handle("select-transcription", async () => {
  const win = BrowserWindow.getFocusedWindow();

  const result = await dialog.showOpenDialog(win, {
    title: "Choisir une transcription",
    defaultPath: OUTPUT_DIR,
    filters: [{ name: "Markdown", extensions: ["md"] }],
    properties: ["openFile"],
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("read-file", async (_, filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return { ok: true, content };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
    const filePath = path.join(__dirname, "public", "audio", fileName);

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
