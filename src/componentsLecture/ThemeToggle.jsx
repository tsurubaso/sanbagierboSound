
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--background", "#0f0f0f");
      root.style.setProperty("--foreground", "#bbbbbb");
      root.style.setProperty("--card-background", "#1a1a1a");
      root.style.setProperty("--border-color", "#333");
    } else {
      root.style.setProperty("--background", "#c4c4c4ff");
      root.style.setProperty("--foreground", "#222222");
      root.style.setProperty("--card-background", "#f4f4f4");
      root.style.setProperty("--border-color", "#ccc");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-4 left-20 z-50 px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
