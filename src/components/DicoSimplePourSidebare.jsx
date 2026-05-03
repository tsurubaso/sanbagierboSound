
import { useState } from "react";

export default function DictionarySidebarSimple() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);

  const fetchDictionary = async () => {
    if (!word) return;
    const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    setResult(data);
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

      {/* Bouton */}
      <button
        onClick={fetchDictionary}
        className="w-full bg-gray-800 p-2 rounded hover:bg-violet-600 text-sm"
      >
        Rechercher
      </button>

      {/* Résultats */}
      <div className="text-left mt-3 text-sm">
        {Array.isArray(result) &&
          result.map((entry, idx) => (
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
          ))}
      </div>
    </div>
  );
}
