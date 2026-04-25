// app/api/forgejo/save-merged/route.js
import { NextResponse } from "next/server";
 
export async function POST(req) {
  try {
    const { book, targetBranch, mergedText } = await req.json();

    if (!book || !targetBranch || typeof mergedText !== "string") {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const repoOwner = process.env.FORGEJO_USER;
    const repoName = process.env.FORGEJO_REPO;
    const token = process.env.FORGEJO_TOKEN;

    // Si tu es dans le réseau Docker, utilise le nom du service 'forgejo'
    // Sinon utilise http://localhost:3000/api/v1
    const BASE_URL = "http://forgejo:3000/api/v1"; 


    if (!repoOwner || !repoName || !token) {
      return NextResponse.json({ error: "Server missing repo config" }, { status: 500 });
    }

    const headers = {
      "Authorization": `token ${token}`, // Format spécifique Forgejo/Gitea
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    const filePath = `${book}.md`;

 // 1) Vérifier si la branche cible existe
    const branchRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/branches/${targetBranch}`, { headers });
    
    if (!branchRes.ok) {
      // Créer la branche à partir de 'main' si elle n'existe pas
      const createBranchRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/branches`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          new_branch_name: targetBranch,
          old_branch_name: "main"
        }),
      });
      if (!createBranchRes.ok) {
        return NextResponse.json({ error: `Impossible de créer la branche ${targetBranch}` }, { status: 500 });
      }
    }

    // 2) Récupérer le SHA du fichier existant sur la branche cible
    let existingSha;
    const getFileRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${targetBranch}`, { headers });
    if (getFileRes.ok) {
      const fileData = await getFileRes.json();
      existingSha = fileData.sha;
    }

// 3) Choisir la méthode : PUT pour mise à jour (si sha existe), POST pour création
    const method = existingSha ? "PUT" : "POST";
    
    const putRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: method, 
      headers,
      body: JSON.stringify({
        message: `merge: ${book} into ${targetBranch}`,
        content: Buffer.from(mergedText, 'utf-8').toString("base64"),
        branch: targetBranch,
        sha: existingSha, // Requis par Forgejo pour un PUT
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      // Si on a encore une 422 malgré le sha, c'est peut-être un conflit de branche
      return NextResponse.json({ error: `Erreur Forgejo (${putRes.status}): ${errText}` }, { status: 500 });
    }


    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
