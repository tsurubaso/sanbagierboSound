import { NextResponse } from "next/server";
import { listBranches, getFile } from "@/lib/gitforgejo";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");

  if (!book) {
    return NextResponse.json({ error: "Missing 'book' parameter" }, { status: 400 });
  }

  try {
    const branches = await listBranches();
    const contents = {};

    for (const branch of branches) {
      try {
        const file = await getFile(`${book}.md`, branch);
        contents[branch] = file;
      } catch {
        // le fichier n'existe peut-être pas sur cette branche
      }
    }

    return NextResponse.json({ branches, contents });
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
