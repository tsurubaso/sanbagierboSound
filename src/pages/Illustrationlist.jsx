import MotionEffects from "@/components/MotionEffects";
const { PulseText, FadeIn, GradientText, HoverZoom } = MotionEffects;

export default function NotFoundIllustrations() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <PulseText
        text="Pas encore… mais ça arrive."
        className="text-violet-700 text-6xl mb-4"
      />

      <FadeIn delay={0.5}>
        <GradientText
          text="Les illustrations sont en préparation"
          className="text-2xl mb-2"
        />
      </FadeIn>

      <p className="text-gray-400 mb-6 max-w-xl">
        Le système d’illustrations n’est pas encore actif, mais il est déjà
        pensé. À terme, vous pourrez intégrer images, dessins, modèles 3D et
        autres médias, directement dans les histoires.
        Pour l'heure vous pouver ajouter les images hebergées ailleurs.
      </p>

      <FadeIn delay={1}>
        <p className="text-gray-500 max-w-xl">
          L’objectif est double : proposer un hébergement dédié pour les
          créations, mais aussi permettre l’utilisation de médias externes via
          un système de tags. Une illustration pourra ainsi être appelée,
          partagée et réutilisée facilement, où qu’elle soit hébergée.
        </p>
      </FadeIn>

      <FadeIn delay={1.5}>
        <p className="text-gray-600 max-w-xl mt-4">
          Pour l’instant, tout est en veille… mais la structure est en place.
        </p>
      </FadeIn>
    </div>
  );
}
