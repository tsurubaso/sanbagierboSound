import React from "react";
import {
  IconRules,
  IconDrafts,
  IconFragments,
  IconStories,
  IconOthers,
  IconIllustrations,
} from "@/components/icons";

export default function Rules() {
  return (
    <main
      className="min-h-screen py-2"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="w-full max-w-4xl p-8 rounded-lg shadow-md border mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-4 flex items-center justify-center gap-2">
          <IconRules size={24} /> Les règles
        </h1>

        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <IconDrafts size={20} /> Nommage
        </h2>

        <ol className="list-decimal pl-6 text-lg mb-6 space-y-3 marker:text-gray-400">
          <li>
            <strong>Nom de la série en premier</strong> — Le titre de la série
            apparaît en premier, suivi du rang de l’histoire sous forme de
            lettre (A, B, C...) au lieu d’un chiffre.
          </li>
          <li>
            <strong>Les lettres manquantes sont autorisées</strong> — Les trous
            dans l’alphabet sont intentionnels.
          </li>
          <li>
            <strong>Univers partagé</strong> — Toutes les histoires se déroulent
            dans le même univers fictif.
          </li>
          <li>
            <strong>Liens souples</strong> — Les connexions entre histoires sont
            légères ; des éléments récurrents peuvent apparaître sans continuité
            stricte.
          </li>
        </ol>

        <hr className="my-8 border-gray-500" />

        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <IconOthers size={20} /> Répartition des histoires
        </h2>
        <ul className="list-disc pl-6 text-lg mb-6 space-y-4">
          <li>
            <div className="flex items-center gap-2">
              <IconDrafts size={16} />
              <strong>Brouillons</strong>
            </div>
            <p className="ml-6 text-gray-400">
              Histoires fraîchement ajoutées, souvent issues de la
              reconnaissance vocale, avec beaucoup de fautes. C’est
              principalement l’espace de travail de l’auteur.
            </p>
          </li>

          <li>
            <div className="flex items-center gap-2">
              <IconFragments size={16} />
              <strong>Fragments</strong>
            </div>
            <p className="ml-6 text-gray-400">
              Parties incomplètes ou extraits, parfois placés ici avant de
              rejoindre la section <em>histoires</em>.
            </p>
          </li>

          <li>
            <div className="flex items-center gap-2">
              <IconStories size={16} />
              <strong>Histoires</strong>
            </div>
            <p className="ml-6 text-gray-400">
              Les œuvres terminées, ou du moins ce que je souhaite qu’elles
              soient.
            </p>
          </li>

          <li>
            <div className="flex items-center gap-2">
              <IconOthers size={16} />
              <strong>Autres</strong>
            </div>
            <p className="ml-6 text-gray-400">
              Textes anciens. Parce que les vieilles choses sont aussi agréables
              à lire.
            </p>
          </li>

          <li>
            <div className="flex items-center gap-2">
              <IconIllustrations size={16} />
              <strong>Illustrations</strong>
            </div>
            <p className="ml-6 text-gray-400">
              <span className="text-red-500">Inactive now. </span>
              D’Illustration en Illustrations, entrez par les images dans
              l&apos;histoire, passez par le carrousel...
            </p>
          </li>
        </ul>

        <hr className="my-8 border-gray-500" />
      </div>
    </main>
  );
}
