import { useLocation, useNavigate } from "react-router-dom";
import ClientWrapper from "@/components/ClientWrapper";
import DictionarySidebarSimple from "@/components/DicoSimplePourSidebare";
import DictionarySidebarFull from "@/components/DicoCompletPourSidebare";
import SpeechToTextLauncher from "@/components/SpeechToTextLauncher";
import ImportTranscriptionButton from "@/components/ImportTranscriptionButton";
import AudioPlayerWaveform from "@/components/AudioPlayerWaveform";

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
  const isReader = pathname.includes("/reader");
  const isEditor = pathname.includes("/editor");
  const isCreator = pathname.includes("/creator");
  const isLecturer = pathname.includes("/lecturer");
  const isMerger = pathname.includes("/merger");

  // Base path
  const basePath = pathname.replace(/\/(reader|editor|creator|lecturer|merger)$/, "");

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
    { href: `${basePath}/reader`, label: "📖 Reader" },
    { href: `${basePath}/editor`, label: "✏️ Editor" },
     { href: `${basePath}/merger`, label: "🔄 Merger" },
    { href: `${basePath}/creator`, label: "🖋️ Creator" },
    { href: `${basePath}/lecturer`, label: "🎤 Lecturer" },
   
  ];

  // Boutons d'action
  const actionButtons = [
    {
      label: "⬅️ Go Back",
      onClick: () => navigate(-1),
    },
  ];

  const actionButtonsGrid = [
    {
      label: "⬅️ Go Back",
      onClick: () => navigate(-1),
    },

    {
      label: "🔄 Rescan Books",
      // onClick: handleRescan,/////////////////////////////////////////////on block for now
    },
  ];

  // === PRIORITÉ AUX MODES ===
  if (isReader) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons} // ✅ Passer les boutons
        rightSidebarContent={<DictionarySidebarSimple />}
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
        rightSidebarContent={
          <div>
            <SpeechToTextLauncher />
            <ImportTranscriptionButton />
          </div>
        }
        showRightDefault={false}
      >
        <AudioPlayerWaveform />
        {children}
      </ClientWrapper>
    );
  }

  if (isEditor || isCreator || isMerger) {
    return (
      <ClientWrapper
        navItemsTop={navItemsTop}
        actionButtons={actionButtons}
        rightSidebarContent={<DictionarySidebarFull />}
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
        rightSidebarContent={
          <div>
            <p> Nothing now </p>
          </div>
        } //
      >
        {children}
      </ClientWrapper>
    );
  }

  if (isDraft || isFragment || isIllustration || isOther || isStory) {
    return (
      <ClientWrapper
        // navItemsTop={navItemsTop}
        actionButtons={actionButtonsGrid}
        rightSidebarContent={<div>Nothing yet, maybe later?</div>} //
        showRightDefault={false}
      >
        {children}
      </ClientWrapper>
    );
  }

  // === PAR DÉFAUT ===
  return <>{children}</>;
}
