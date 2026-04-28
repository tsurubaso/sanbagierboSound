import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar.jsx"; // ton composant Search séparé
import { getBooksData } from "@/services/getBooksData.jsx";
import ThemeToggle from "@/components/ThemeToggle";
export default function StoriesGrid({
  status,
  basePath,
  textDePresentation,
}) {
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

useEffect(() => {
  const fetchStories = async () => {
    try {
      const data = await getBooksData();
      setStories(data.filter((s) => s.status === status));
    } catch (error) {
      console.error("Erreur lors du chargement des stories :", error);
    }
  };
  fetchStories();
}, [status]);

  // 🔍 Filtrage par recherche
  const filteredStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔗 Navigation interne
  const handleClick = (story) => {
    navigate(`/${basePath}/${status}list/${story.link}/reader`);
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
         {/* Theme toggle button */}
      <ThemeToggle />
      <div className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            LunaTech Library
          </h1>
          <p className="opacity-80 max-w-xl mx-auto">{textDePresentation}</p>

          {/* 🔍 Barre de recherche */}
          <SearchBar
            placeholder="Rechercher une story..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleClick(story)}
                className="rounded-2xl p-5 border transition-transform cursor-pointer hover:-translate-y-1 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: "var(--card-background)",
                  borderColor: "var(--border-color)",
                }}
              >
                <h3 className="text-xl font-semibold">{story.title}</h3>
                <p className="mt-2 opacity-80 line-clamp-3">
                  {story.description}
                </p>
                <p className="text-sm mt-4 italic opacity-60">{story.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 mt-12 space-y-4">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <p>Chargement en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
