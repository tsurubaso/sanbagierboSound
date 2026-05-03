// app/api/forgejo/delete-branch/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { branch } = await req.json();
  const repoOwner = process.env.FORGEJO_USER;
  const repoName = process.env.FORGEJO_REPO;
  const token = process.env.FORGEJO_TOKEN;
  const BASE_URL = "http://forgejo:3000/api/v1";

  const res = await fetch(`${BASE_URL}/repos/${repoOwner}/${repoName}/branches/${branch}`, {
    method: "DELETE",
    headers: { "Authorization": `token ${token}` },
  });

  if (res.ok) return NextResponse.json({ success: true });
  return NextResponse.json({ error: "Fail" }, { status: 500 });
}