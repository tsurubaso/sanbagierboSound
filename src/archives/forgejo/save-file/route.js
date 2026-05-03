import { saveFile, listBranches, createBranch } from "@/lib/gitforgejo";

export async function POST(req) {
  try {
    const { book, content, branch, message } = await req.json();

    if (!book) {
      return new Response(JSON.stringify({ error: "Book name is required" }), { status: 400 });
    }

    // 🔍 Vérifie si la branche existe
    const branches = await listBranches();
    const branchExists = branches.includes(branch);

    // 🌱 Si la branche n'existe pas, on la crée depuis main
    if (!branchExists) {
      console.log(`🪴 Creating new branch: ${branch} (from main)`);
      await createBranch(branch, "main");
    }

    // 💾 Sauvegarde le fichier (création ou update)
    const result = await saveFile(book, content, branch, message || `Update ${book}`);

    return new Response(JSON.stringify({ success: true, result }), { status: 200 });

  } catch (e) {
    console.error("❌ save-file error:", e);
    return new Response(
      JSON.stringify({ error: e.message || e.toString() }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ============================

/*



export async function saveFile(fileName, content, branch = "main") {
  const url = `${process.env.FORGEJO_URL}/api/v1/repos/${process.env.FORGEJO_REPO}/contents/public/books/${fileName}`;

  const encoded = Buffer.from(content).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${process.env.FORGEJO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: encoded,
      message: `update ${fileName}`,
      branch,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Forgejo error: " + text);
  }

  return await response.json();
}

*/