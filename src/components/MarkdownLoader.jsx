// components/MarkdownLoader.jsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function MarkdownLoader({ link }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const text = await window.electronAPI.readMarkdown(link);
        setContent(text);
      } catch (err) {
        console.error("Erreur de chargement du Markdown:", err);
        setError(true);
      }
    };

    loadFile();
  }, [link]);

  if (error) return <p className="text-red-400">Histoire introuvable</p>;
  if (!content) return <p className="text-gray-400">Chargement...</p>;

  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>;
}
