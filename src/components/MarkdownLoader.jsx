import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function MarkdownLoader({ url,raw = false, selectedBranch }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);
  console.log("🔗 Loading Markdown from URL:", url);

  useEffect(() => {
    if (!url) return;

    const loadFile = async () => {
      try {
        const text = await window.electronAPI.readMarkdown({
          url: `${url}?ref=${selectedBranch}`,
          raw: raw,
        });
        setContent(text);
      } catch (err) {
        console.error("Erreur de chargement du Markdown:", err);
        setError(true);
      }
    };

    loadFile();
  }, [url, selectedBranch]);

  if (error) return <p className="text-red-400">Histoire introuvable</p>;
  if (!content) return <p className="text-gray-400">Chargement...</p>;

  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>;
}
