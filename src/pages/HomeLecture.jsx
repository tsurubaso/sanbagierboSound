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
  const routes = [
    { label: "C'est par là!", path: "/BILLY/Rules" },

  ];
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
            text="🚀 Notre objectif 🚀"
            className="text-3xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Un nouveau médium pour aider la créativité de nos auteurs. Chacun
            d&apos;eux pourra partager et promouvoir son travail facilement,
            collaborer et échanger sans complications.
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
            text="📖 Lecteur 📖"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Simplicité et accès direct au contenu avant tout. Profitez de la
            lecture sans effort.
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
            text="✍️ Éditeur ✍️"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>
        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Travaillez main dans la main avec vos collaborateurs, partagez et
            corrigez sans jamais toucher à l’original.
          </h2>
        </SlideIn>

        {/* Fusionneur */}
        <HeroSection
          direction="right"
          duration="3"
          text="Screenshot mergeur"
          image="/screenShotMerger.jpg"
          hover
        >
          <GradientText
            text="🔀 Mergeur 🔀"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>
        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Cette partie de l&apos;app permet de relire, comparer et fusionner
            les corrections pour créer une version finale harmonisée.
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
            text="🌈 Évolutions futures 🌈"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <SlideIn duration="3" from="left" className="bg-gray-600">
          <h2 className="text-4xl font-bold">
            Bientôt : Ajouter images, photos, dessins et modèles 3D, partager
            sur réseaux sociaux, nouvelles options de collaboration créative.
          </h2>
        </SlideIn>
        <HeroSection
          image="/image2.jpg"
          duration="3"
          text="black and white moon"
          direction="right"
          hover
        >
          <GradientText
            text="👁️Notre Vision👁️"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <ScrollColorSection
          text="Vous avez toujours lu de merveilleuses histoires…
De grands auteurs, de grandes aventures.
Mais à quoi sert une histoire sans illustration ?

Pensez à Jules Verne sans Édouard Riou, Alphonse de Neuville, Léon Benett et Jules Férat.
Ou encore Émile-Antoine Bayard !

Oui, vous voyez, dans votre esprit — et pour des générations — ces histoires ont toujours été illustrées.
L’art de l’éditeur a toujours été de combiner le texte et l’image.
Pour Jules, c’était Pierre-Jules Hetzel."
        />
        <HeroSection image="/image3.jpg" text="detail de la Lune" hover>
          <GradientText
            text="🛠️Le projet?🛠️"
            className="text-4xl font-bold text-center"
          />
        </HeroSection>

        <ScrollShiftSection
          text="
        L’objectif est de promouvoir, et à terme, de rémunérer les créateurs :
Illustrateurs, Graphistes, Peintres, Photographes, Artistes 3D... c’est open bar !
Mais tout reste à faire, et à tous les niveaux...Mais Parbleu que c'est amusant de faire ce qu'on aime.
Pour ce que l'on aime, pour ceux que l'on aime."
        />

        <AnimatedText
          text="📚 Comment contribuer?"
          duration={10}
          className="text-4xl font-semibold"
        />

        <SlideIn from="left" className="bg-blue-200">
          <p className="p-10 bg-gray  rounded-xl text-2xl font-bold">
            Je vous invite à lire les histoires, à repérer où des illustrations
            pourraient s’intégrer — nous nous chargerons du reste.
          </p>
        </SlideIn>

        <HeroSection
          image="/image5.jpg"
          text="En avant!"
          direction="right"
          hover
        />

        <div className="relative flex justify-center mt-6">
          {/* --- IMAGE DE FOND --- */}
          <img
            src="/image6.jpg"
            alt="Fond"
            width={1000}
            height={600}
            className="rounded-lg object-cover"
            style={{ width: "100%", height: "auto", maxHeight: "600px" }}
          />

          {/* --- BOUTONS PAR-DESSUS --- */}
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
