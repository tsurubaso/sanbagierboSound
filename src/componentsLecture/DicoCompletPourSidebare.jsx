
import { useState } from "react";

export default function DictionarySidebarFull() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const LABELS_FR = {
    synonym: "Synonymes",
    antonym: "Antonymes",
    champlexical: "Champ lexical",
  };

  const fetchData = async (type) => {
    if (!word) return;
    const endpoint =
      type === "dictionary"
        ? `/api/dictionary?word=${encodeURIComponent(word)}`
        : `/api/synonyms?word=${encodeURIComponent(word)}&type=${type}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    setResult({ type, data });
  };

  return (
    <div className="mt-auto pt-4 text-center space-y-4">
      <h2 className="text-xl font-semibold">Dico FR</h2>

      {/* Input */}
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Tapez un mot"
        className="border p-2 w-full text-white bg-gray-800 rounded text-sm"
      />

      {/* Boutons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => fetchData("dictionary")}
          className="flex-1 bg-gray-800 p-2 rounded hover:bg-violet-600 text-sm"
        >
          Dictionnaire
        </button>
        <button
          onClick={() => fetchData("synonym")}
          className="flex-1 bg-gray-800 p-2 rounded hover:bg-red-600 text-sm"
        >
          Synonymes
        </button>
        <button
          onClick={() => fetchData("antonym")}
          className="flex-1 bg-gray-800 p-2 rounded hover:bg-green-600 text-sm"
        >
          Antonymes
        </button>
        <button
          onClick={() => fetchData("champlexical")}
          className="flex-1 bg-gray-800 p-2 rounded hover:bg-blue-600 text-sm"
        >
          Champ lexical
        </button>
      </div>

      {/* Résultats */}
      <div className="text-left mt-3 overflow-y-auto text-sm">
        {result && result.type === "dictionary" && Array.isArray(result.data) && (
          result.data.map((entry, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-bold">{entry.mot}</h3>
              <p>{entry.definition}</p>
              {entry.dicolinkUrl && (
                <a
                  href={entry.dicolinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 underline text-xs"
                >
                  Source
                </a>
              )}
            </div>
          ))
        )}

        {result && LABELS_FR[result.type] && Array.isArray(result.data) && (
          <div>
            <h3 className="font-bold mb-1 capitalize">
              {LABELS_FR[result.type]}
            </h3>
            <ul className="list-disc pl-5">
              {result.data.map((entry, idx) => (
                <li key={idx}>
                  <a
                    href={entry.dicolinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-300 underline"
                  >
                    {entry.mot}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
