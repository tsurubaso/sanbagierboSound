import { deleteFile } from "@/lib/gitforgejo";

export async function DELETE(req) {
  try {
    const { name, sha } = await req.json();
    const result = await deleteFile(name, sha);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}