import { useState } from "react";

import { useLocation } from "react-router-dom";

import ThemeToggle from "./ThemeToggle";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

import {
  IconRules,
  IconStories,
  IconDrafts,
  IconFragments,
  IconOthers,
  IconIllustrations,
} from "@/components/icons";

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
    {
      href: `/${currentPerson}/Rules`,
      label: (
        <span className="flex items-center gap-2">
          <IconRules size={18} /> Les Règles
        </span>
      ),
    },
    {
      href: `/${currentPerson}/storylist`,
      label: (
        <span className="flex items-center gap-2">
          <IconStories size={18} /> Histoires
        </span>
      ),
    },
    {
      href: `/${currentPerson}/draftlist`,
      label: (
        <span className="flex items-center gap-2">
          <IconDrafts size={18} /> Brouillons
        </span>
      ),
    },
    {
      href: `/${currentPerson}/fragmentlist`,
      label: (
        <span className="flex items-center gap-2">
          <IconFragments size={18} /> Fragments
        </span>
      ),
    },
    {
      href: `/${currentPerson}/otherlist`,
      label: (
        <span className="flex items-center gap-2">
          <IconOthers size={18} /> Autres
        </span>
      ),
    },
    {
      href: `/${currentPerson}/illustrationlist`,
      label: (
        <span className="flex items-center gap-2">
          <IconIllustrations size={18} /> Illustrations
        </span>
      ),
    },
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
