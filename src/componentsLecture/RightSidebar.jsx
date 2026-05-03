export default function RightSidebar({ description, content }) {
  return (
    <aside className="w-64 bg-black text-white transition-all duration-700 p-4 border-l flex flex-col justify-between">
      <nav className="space-y-4">
        {/* Description dynamique */}
        <div className="text-sm text-gray-300">
          {description || ""}
        </div>
        {/* Contenu additionnel */}
        <div className="mt-6 pt-4">{content}</div>
      </nav>
    </aside>
  );
}
//GitHubSideBar.js
