// app/api/forgejo/books/route.js
import { listStoriesFromForgejo } from "@/lib/gitforgejo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "story";

  try {
    const stories = await listStoriesFromForgejo("main");
    const filtered = stories.filter((s) => s.status === status);
    return new Response(JSON.stringify(filtered), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    console.error("Erreur dans /api/forgejo/books :", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
