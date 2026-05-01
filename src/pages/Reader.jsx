import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MarkdownLoader from "@/components/MarkdownLoader";
import { getBooksData } from "@/services/getBooksData";

export default function ReaderPage() {
  const { link } = useParams(); // 👈 clé
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getBooksData();

      const book = data.find((b) => b.link === link);

      if (!book) {
        console.error("❌ Book not found:", link);
        return;
      }

      setUrl(book.url);
    };

    load();
  }, [link]);

  if (!url) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen bg-[#1e1e1e] text-gray-100">
      <main className="flex-1 p-2 bg-[#2a2a2a]">
        <div className="p-8 markdown-content prose prose-invert">
          <MarkdownLoader url={url} />
        </div>
      </main>
    </div>
  );
}