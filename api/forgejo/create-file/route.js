import { saveFile } from "@/lib/gitforgejo";

export async function POST(req) {
  try {
    // On récupère "book" au lieu de "fileName"
    const { book, content, branch } = await req.json();
    
    // On ajoute l'extension .md si nécessaire (puisque ton front envoie juste le nom du livre)
    const fullFileName = book.endsWith('.md') ? book : `${book}.md`;

    const result = await saveFile(fullFileName, content, branch);
    return Response.json(result);
  } catch (error) {
    console.error("API Save Error:", error); // Ajoute un log pour debug en console serveur
    return Response.json({ error: error.message }, { status: 500 });
  }
}


