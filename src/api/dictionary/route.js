import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get("word");

    if (!word) {
      return NextResponse.json({ error: "No word provided" }, { status: 400 });
    }

    // dictionary
    const frdicokey = process.env.FRDICOKEY;

    const res = await fetch(
      `https://api.dicolink.com/v1/mot/${word}/definitions?limite=200&api_key=${frdicokey}`
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur Dicolink" },
        { status: response.status }
      );
    }

    // other dico const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    // ⚠️ On ne garde que les champs utiles
    const formatted = data.map((entry) => ({
      mot: entry.mot,
      definition: entry.definition,
      dicolinkUrl: entry.dicolinkUrl,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
