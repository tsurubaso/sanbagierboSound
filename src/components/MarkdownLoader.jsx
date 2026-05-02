import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function MarkdownLoader({ url, raw = false, selectedBranch = "main" }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const loadFile = async () => {
      try {
        setError(false); // Reset l'erreur au début du chargement
        
        // 💡 On remplace dynamiquement la branche dans l'URL (ex: /branch/main/ -> /branch/ver3/)
        const dynamicUrl = url.replace(/\/branch\/[^/]+/, `/branch/${selectedBranch}`);
        
        console.log(`📖 Reader loading [${selectedBranch}] from:`, dynamicUrl);

        const text = await window.electronAPI.readMarkdown({
          // On utilise l'URL transformée et un timestamp pour éviter le cache
          url: `${dynamicUrl}?t=${Date.now()}`,
          raw: raw,
        });

        setContent(text);
      } catch (err) {
        console.error("Erreur de chargement du Markdown:", err);
        setError(true);
      }
    };

    loadFile();
  }, [url, selectedBranch, raw]); // On recharge si l'URL, la branche ou le mode raw change

  if (error) return <p className="text-red-400 p-4">Histoire introuvable ou erreur réseau.</p>;
  if (!content) return <p className="text-gray-400 p-4">Chargement de la version {selectedBranch}...</p>;

  return (
    <div className="markdown-container p-4 overflow-auto h-full">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}