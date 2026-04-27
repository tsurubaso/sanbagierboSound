// src/pages/PersonListPage.jsx
import { useParams } from "react-router-dom";
import StoriesGrid from "@/components/StoriesGrid";

const descriptions = {
  draftlist: "Les Brouillons, essentiellement des enregistrements de speech-to-text, beaucoup de fautes à prévoir.",
  fragmentlist: "LFragments d'histoires ou l'étape entre histoire et brouillon",
  storylist: "Les histoires toutes centrées sur un univers, sur la collonisation de la Lune",
  otherlist: "Beaucoup de choses faites avant que je ne sache ce que je faisais vraiment.",
  illustrationlist: "Les dessins, images et concepts visuels.",
};

export default function PersonListPage() {
  const { person, statuslist } = useParams();

  const status = statuslist.replace("list", ""); // "draftlist" → "draft"
  const textDePresentation = descriptions[statuslist] || "Aucune description disponible.";

  return (
    <StoriesGrid
      basePath={person}
      status={status}
      textDePresentation={textDePresentation}
    />
  );
}
