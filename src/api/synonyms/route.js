// app/api/synonyms/route.js

import { NextResponse } from "next/server";

export async function GET(req) {
  
    const { searchParams } = new URL(req.url);
    const word = searchParams.get("word");
    const type = searchParams.get("type"); // synonym | antonym | champlexical
    const frdicokey = process.env.FRDICOKEY;

    if (!word || !type) {
      return NextResponse.json({ error: "Missing word or type" }, { status: 400 });
    }
  // Map type to API endpoint
  const endpointMap = {
    synonym: "synonymes",
    antonym: "antonymes",
    champlexical: "champlexical",
  };

    if (!endpointMap[type]) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.dicolink.com/v1/mot/${encodeURIComponent(word)}/${endpointMap[type]}?limite=200&api_key=${frdicokey}`
    );

        if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur Dicolink" },
        { status: res.status }
      );
    }
    const data = await res.json();
    // ⚠️ Ici pas de "definition", juste mot + URL
    const formatted = data.map((entry) => ({
      mot: entry.mot,
      dicolinkUrl: entry.dicolinkUrl,
    }));

    return NextResponse.json(formatted);


  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
