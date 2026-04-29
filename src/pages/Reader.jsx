// src/pages/ReaderPage.jsx

import { useLocation } from "react-router-dom";

import MarkdownLoader from "@/components/MarkdownLoader";

export default function ReaderPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const url = location.state?.url || params.get("url");
  console.log("📖 Final URL:", url);

  return (
    <div>
      <div className="flex min-h-screen bg-[#1e1e1e] text-gray-100">
        <main className="flex-1 p-2 bg-[#2a2a2a]">
          <div className="p-8 markdown-content prose prose-invert">
            <MarkdownLoader url={url} />
          </div>
        </main>
      </div>
    </div>
  );
}
