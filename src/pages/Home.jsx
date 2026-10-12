import React from "react";
import MotionEffects from "../components/MotionEffects";
import { useNavigate } from "react-router-dom";

const {
  //PulseText,
  //FadeIn,
  GradientText,
  //TypingText,
  //HoverZoom,
  HeroSection,
  ScrollColorSection,
  ScrollShiftSection,
  AnimatedText,
  SlideIn,
} = MotionEffects;

const Home = () => {
  const navigate = useNavigate();
 const routes = [{ label: "En Avant!!!", path: "/BILLY/Rules" }];
  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center py-2 px-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="w-full max-w-4xl p-8 rounded-lg shadow-md border space-y-5">
        {/* Objectif */}
        <HeroSection
          direction="right"
          duration="3"
          text="Full Moon"
          image="/image.jpg"
          hover
        >
          <GradientText
            text="Notre objectif"
            className="text-3xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Un nouveau médium pensé pour stimuler la créativité des auteurs.
            Partagez vos créations, collaborez librement et faites évoluer vos
            textes simplement. Lecteurs, auteurs et collaborateurs utilisent le
            même environnement. Selon vos droits d’accès, vous pouvez lire,
            écrire, éditer ou fusionner différentes versions d’un texte.
          </h2>
        </SlideIn>

        {/* Lecteur */}
        <HeroSection
          direction="right"
          duration="3"
          text="screenshot lecteur"
          image="/screenShotLecteur.jpg"
          hover
        >
          <GradientText
            text="Lecteur"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Un accès direct aux œuvres, sans distraction. Lire doit rester
            simple, fluide et naturel.
          </h2>
        </SlideIn>

        {/* Éditeur */}
        <HeroSection
          direction="right"
          duration="3"
          text="screenshot éditeur"
          image="/screenShotEditor.jpg"
          hover
        >
          <GradientText
            text="Éditeur"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Travaillez avec vos collaborateurs. Corrigez, échangez et
            expérimentez librement avec la sécurité d’un historique complet de
            vos modifications.
          </h2>
        </SlideIn>

        {/* Mergeur */}
        <HeroSection
          direction="right"
          duration="3"
          text="Screenshot mergeur"
          image="/screenShotMerger.jpg"
          hover
        >
          <GradientText
            text="Mergeur"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Relisez, comparez et fusionnez les corrections afin de construire
            une version finale cohérente et harmonisée.
          </h2>
        </SlideIn>

        {/* Creator */}
        <HeroSection
          direction="right"
          duration="3"
          text="Screenshot creator"
          image="/screenShotCreator.png"
          hover
        >
          <GradientText
            text="Creator"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Créez de nouveaux textes et sauvegardez-les directement sur Forgejo.
            Chaque idée devient une base de travail versionnée, modifiable et
            partageable.
          </h2>
        </SlideIn>

        {/* Lecteur audio */}
        <HeroSection
          direction="right"
          duration="3"
          text="Reconnaissance vocale"
          image="/screenShotSpeech.png"
          hover
        >
          <GradientText
            text="Lecteur audio"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Écoutez et visualisez vos enregistrements audio simplement.
          </h2>
        </SlideIn>

        {/* Visualiseur audio */}
        <HeroSection
          direction="right"
          duration="3"
          text="Audio et écoute"
          image="/screenShotSound.png"
          hover
        >
          <GradientText
            text="Visualiseur audio"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Transformez votre voix en texte instantanément. Dictez vos idées et
            obtenez immédiatement une base de travail exploitable.
          </h2>
        </SlideIn>

        {/* Évolutions futures */}
        <HeroSection
          direction="right"
          duration="3"
          text="Melies Moon"
          image="/image4.jpg"
          hover
        >
          <GradientText
            text="Un petit secret"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Certains et certaines de nos collaborateurs sont des magiciens.
            Invisibles et silencieux. vous les voyez et les croisez, ils sont là
            autour de vous. Ils resteront discrets et mystérieux. Nous
            souhaitons conserver la magie de cette collaboration. Ici, une
            certaine forme d'anonymat est autorisée.
          </h2>
        </SlideIn>

        {/* Projet et vision */}
        <HeroSection
          image="/image3.jpg"
          duration="3"
          text="detail de la Lune"
          direction="right"
          hover
        >
          <GradientText
            text="Notre Vision"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <ScrollShiftSection
          text={`
            L’objectif est de valoriser les créateurs et, à terme, de leur permettre d’être rémunérés.
Ce projet est ouvert à tous et en constante évolution. Beaucoup reste à construire, à imaginer et à expérimenter, et chacun peut y contribuer.

Je vous invite à lire, à créer, à modifier vos propres textes comme ceux des autres, et à partager vos découvertes et vos créations.

Chaque auteur reste maître de son œuvre.

Ensemble, faisons grandir cet espace collaboratif, libre et vivant.

`}
        />

        {/* Final */}
        <div className="relative flex justify-center mt-6">
          <img
            src="/image6.jpg"
            alt="Fond"
            width={1000}
            height={600}
            className="rounded-lg object-cover"
            style={{ width: "100%", height: "auto", maxHeight: "600px" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center space-y-3">
            {routes.map((route) => (
              <button
                key={route.path}
                onClick={() => handleClick(route.path)}
                className="px-5 py-6 bg-pink-600/80 text-white font-semibold rounded-lg hover:bg-blue-600/80 transition"
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;