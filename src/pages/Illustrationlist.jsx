import MotionEffects from "@/components/MotionEffects";
const { PulseText, FadeIn, GradientText, HoverZoom } = MotionEffects;

export default function NotFoundIllustrations() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <PulseText
        text="Et ben non !"
        className="text-violet-700 text-6xl mb-4"
      />
      <FadeIn delay={0.5}>
        <GradientText
          text="Pas d'illustrations mais ça va venir !"
          className="text-2xl mb-2"
        />
      </FadeIn>
      <p className="text-gray-400 mb-6">
        Photos, dessins, 3D… tout est en pause 🎨
      </p>
    </div>
  );
}
