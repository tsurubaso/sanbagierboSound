import { useState } from "react";

import { useLocation } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

export default function ClientWrapper({
  children,
  navItemsTop = [],
  actionButtons = [],
  rightSidebarDescription = null,
  rightSidebarContent = null,
  showRightDefault = true, //
}) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(showRightDefault);
  const [showTop] = useState(true);
  const [showFooter] = useState(true);

  const location = useLocation();
  const pathname = location.pathname;

  // Exemple: "/BILLY/draftlist/reader" → ["", "BILLY", "draftlist", "reader"]
  const [, person] = pathname.split("/");

  // Fallback au cas où on est sur "/" ou route sans nom
  const currentPerson = person;

  const navItems = [
    { href: `/${currentPerson}/Rules`, label: "📜 Les Règles" },
    { href: `/${currentPerson}/storylist`, label: "📚 Histoires" },
    { href: `/${currentPerson}/draftlist`, label: "📝 Brouillons" },
    { href: `/${currentPerson}/fragmentlist`, label: "✂️ Fragments" },
    { href: `/${currentPerson}/otherlist`, label: "🗂️ Autres" },
    { href: `/${currentPerson}/illustrationlist`, label: "🎨 Illustrations" },
  ];

  return (
    <>
      <ThemeToggle />
      <div className="flex flex-col min-h-screen">
        {showTop && (
          <TopBar
            onToggleLeft={() => setShowLeft(!showLeft)}
            onToggleRight={() => setShowRight(!showRight)}
           navItems={navItemsTop}
          actionButtons={actionButtons}
          />
        )}

        <div className="flex flex-1 min-h-0">
          {showLeft && <LeftSidebar navItems={navItems} />}
          <main className="flex-1 p-4 overflow-y-auto">{children}</main>
          {showRight && (
            <RightSidebar
              description={rightSidebarDescription}
              content={rightSidebarContent}
            />
          )}
        </div>

        {showFooter && <Footer />}
      </div>
    </>
  );
}
