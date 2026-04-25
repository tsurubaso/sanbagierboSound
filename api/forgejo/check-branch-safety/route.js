import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { sourceBranch } = await req.json();
    const repoOwner = process.env.FORGEJO_USER;
    const repoName = process.env.FORGEJO_REPO;
    const token = process.env.FORGEJO_TOKEN;
    const BASE_URL = "http://forgejo:3000/api/v1";
    const headers = { "Authorization": `token ${token}`, "Accept": "application/json" };

    // 1. Lister tous les fichiers de la branche source
    // On utilise l'endpoint 'git/trees' pour avoir tout d'un coup (récursif)
    const treeRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/git/trees/${sourceBranch}?recursive=1`, { headers });
    if (!treeRes.ok) throw new Error("Impossible de lire l'arborescence de la branche");
    
    const treeData = await treeRes.json();
    const files = treeData.tree.filter(item => item.type === "blob");

    let diffs = [];

    // 2. Comparer chaque fichier avec la branche main
    for (const file of files) {
      const mainFileRes = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/contents/${file.path}?ref=main`, { headers });
      
      if (!mainFileRes.ok) {
        // Le fichier n'existe pas du tout sur main
        diffs.push({ path: file.path, reason: "Absent sur main" });
        continue;
      }

      const mainFileData = await mainFileRes.json();
      if (mainFileData.sha !== file.sha) {
        // Le contenu est différent (le SHA Git change si le contenu change)
        diffs.push({ path: file.path, reason: "Contenu différent" });
      }
    }

    // 3. Conclusion
    const isSafeToDelete = diffs.length === 0;

    return NextResponse.json({ 
      success: true, 
      isSafeToDelete, 
      remainingFiles: diffs 
    });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}