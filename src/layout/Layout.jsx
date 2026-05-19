import { useLocation, useNavigate } from "react-router-dom";
import ClientWrapper from "@/components/ClientWrapper";
import SpeechToTextLauncher from "@/components/SpeechToTextLauncher";
import ImportTranscriptionButton from "@/components/ImportTranscriptionButton";
import AudioPlayerWaveform from "@/components/AudioPlayerWaveform";

import {
  IconReader,
  IconEditor,
  IconMerger,
  IconCreator,
  IconLecturer,
  IconSoundWork,
  IconBack,
  IconRescan,
} from "@/components/icons";

export default function PersonLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Catégories principales
  const isDraft = pathname.includes("draftlist");
  const isFragment = pathname.includes("fragmentlist");
  const isIllustration = pathname.includes("illustrationlist");
  const isOther = pathname.includes("otherlist");
  const isStory = pathname.includes("storylist");
  const isRules = pathname.includes("Rules");

  // Modes
  const isReader = pathname.endsWith("/reader");
  const isEditor = pathname.endsWith("/editor");
  const isCreator = pathname.endsWith("/creator");
  const isLecturer = pathname.endsWith("/lecturer");
  const isMerger = pathname.endsWith("/merger");
  const isSoundWork = pathname.endsWith("/soundwork");


  //not in use now:
  // rightSidebarContent

  // Base path
  const basePath = pathname.split("/").slice(0, -1).join("/");
  // const basePath = pathname.replace(/\/(reader|editor|creator|lecturer|merger|soundwork|audioprocessing)$/, "");

  //  Fonction pour rescanner
  const handleRescan = async () => {
    try {
      await window.electronAPI.rescanBooks();
      console.log("✅ Livres rescannés !");
      // Optionnel : recharger la page pour voir les changements
      window.location.reload();
    } catch (err) {
      console.error("❌ Erreur rescan:", err);
    }
  };

  const navItemsTop = [
    {
      href: `${basePath}/reader`,
      label: (
        <span className="flex items-center gap-2">
          <IconReader size={18} /> Reader
        </span>
      ),
    },
    {
      href: `${basePath}/editor`,
      label: (
        <span className="flex items-center gap-2">
          <IconEditor size={18} /> Editor
        </span>
      ),
    },
    {
      href: `${basePath}/merger`,
      label: (
        <span className="flex items-center gap-2">
          <IconMerger size={18} /> Merger
        </span>
      ),
    },
    {
      href: `${basePath}/creator`,
      label: (
        <span className="flex items-center gap-2">
          <IconCreator size={18} /> Creator
        </span>
      ),
    },
    {
      href: `${basePath}/lecturer`,
      label: (
        <span className="flex items-center gap-2">
          <IconLecturer size={18} /> Lecturer
        </span>
      ),
    },
    {
      href: `${basePath}/soundwork`,
      label: (
        <span className="flex items-center gap-2">
          <IconSoundWork size={18} /> Sounder
        </span>
      ),
    },
  ];

  // Boutons d'action
  const actionButtons = [
    {
      label: (
        <span className="flex items-center gap-2">
          <IconBack size={16} /> Go Back
        </span>
      ),
      onClick: () => navigate(-1),
    },
  ];

  const actionButtonsGrid = [
    {
      label: (
        <span className="flex items-center gap-2">
          <IconBack size={16} /> Go Back
        </span>
      ),
      onClick: () => navigate(-1),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <IconRescan size={16} /> Rescan Books
        </span>
      ),
      onClick: handleRescan,
    },
  ];

  // === PRIORITÉ AUX MODES ===
  if (isReader) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons} // ✅ Passer les boutons
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  if (isLecturer) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons} // ✅ Passer les boutons

        showRightDefault={false}
      >
        {isLecturer && <AudioPlayerWaveform />}
        {children}
      </ClientWrapper>
    );
  }

  if (isEditor || isCreator || isMerger) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons}
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  if (isSoundWork) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons}
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  // === ENSUITE LES CATÉGORIES ===
  if (isRules) {
    return (
      <ClientWrapper
        // navItemsTop={navItemsTop}
        actionButtons={actionButtons}
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  // === les grids ===
  if (isDraft || isFragment || isIllustration || isOther || isStory) {
    return (
      <ClientWrapper
        // navItemsTop={navItemsTop}
        actionButtons={actionButtonsGrid}
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  // === PAR DÉFAUT ===
  return <>{children}</>;
}
