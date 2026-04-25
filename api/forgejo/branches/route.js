
// app/api/forgejo/branches/route.js
import {listBranches } from "@/lib/gitforgejo";

export async function GET() {
  try {
    const branches = await listBranches();
    return new Response(JSON.stringify(branches), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}