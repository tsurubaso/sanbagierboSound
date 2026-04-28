
import { useScroll, useTransform, motion } from "framer-motion"; 
import { useRef } from "react";



// Texte qui pulse lentement
const PulseText = ({ text, className = "" }) => (
  <motion.h1
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className={`inline-block ${className}`}
  >
    {text}
  </motion.h1>
);

// Apparition avec fade et translation
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const variants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: -20 },
    right: { x: 20 },
  };
  return (
    <motion.div
      initial={{ opacity: 0, ...variants[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

// Gradient animé
const GradientText = ({ text, className = "" }) => (
  <motion.h2
    animate={{
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className={`text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-purple-600 bg-[length:200%_200%] ${className}`}
  >
    {text}
  </motion.h2>
);

// Typing effect
const TypingText = ({ text, className = "" }) => (
  <motion.span className={className}>
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.05, delay: i * 0.03 }}
      >
        {char}
      </motion.span>
    ))}
  </motion.span>
);

// Parallax léger sur hover
const HoverZoom = ({ children }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    {children}
  </motion.div>
);

const AnimatedText = ({
  text = "Welcome to the SanSuBagier !",
  duration = 2,
  ease = "linear",
  className = "",
}) => {
  return (
    <motion.span
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      viewport={{ once: true, amount: 0.6 }} // déclenche une seule fois à 30% visible
      transition={{ duration, ease }}
      className={`inline-block overflow-hidden whitespace-nowrap ${className}`}
    >
      {text}
    </motion.span>
  );
};

const ScrollShiftSection = ({text="Colorful Scroll ✨"}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["-50px", "0px", "50px"]
  );
   // ✅ S'assure que `text` est toujours une string
  const displayText = typeof text === "object" ? text.text || "" : text;
  return (
    <section
      ref={ref}
      className="min-h-[300px] flex items-center justify-center bg-gray-500"
    >
      <motion.div
        viewport={{ amount: 0.3, once: false }}
        style={{ x }}
        className="p-10 bg-gray  rounded-xl text-2xl font-bold"
      >
         {displayText}
      </motion.div>
    </section>
  );
};

const ScrollColorSection = ({text="Colorful Scroll ✨"}) => {
  const colorRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: colorRef,
    offset: ["start end", "end start"],
  });

  const bgColor = useTransform(scrollYProgress, [0, 1], ["#1e3a8a", "#facc15"]);
  const textColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["#ffffff", "#000000"]
  );

    // ✅ S'assure que `text` est toujours une string
  const displayText = typeof text === "object" ? text.text || "" : text;

  return (
    <motion.section
      ref={colorRef}
      style={{ backgroundColor: bgColor }}
      className="flex min-h-[500px] items-center justify-center"
    >
      <motion.h1 style={{ color: textColor }} className="text-5xl font-bold">
        {displayText}
      </motion.h1>
    </motion.section>
  );
};

const SlideIn = ({ from = "left", duration = 1, children, className }) => {
  const initialX = from === "left" ? -200 : 200;
  return (
    <motion.div
      viewport={{ amount: 0.3, once: false }}
      initial={{ x: initialX, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration }}
      className={`p-6 rounded-lg shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HeroSection = ({
  image,
  text,
  children,         // ← ajout
  duration = 1.5,
  direction = "left",
  hover = false,
  rounded = "xl", // ajout optionnel
}) => {
  const initialX = direction === "left" ? -200 : 200;

  return (
    <motion.div
      className={`relative w-full h-64 md:h-96 lg:h-[500px] cursor-default overflow-hidden rounded-${rounded}`}
      initial={{ x: initialX, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration, ease: "easeOut" }}
      whileHover={hover ? { scale: 1.05 } : {}}
    >
      <img src={image} alt={text} className="object-cover" />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        whileHover={hover ? { y: -10 } : {}}
        transition={{ duration: 0.3 }}
      >
         {/* Si on a des enfants, on les affiche ; sinon on garde le texte classique */}
        {children || (
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">{text}</h1>
        )}
      </motion.div>
    </motion.div>
  );
};

// 🧩 On assigne d'abord à une variable
const MotionEffects = {
  HeroSection,
  SlideIn,
  ScrollColorSection,
  ScrollShiftSection,
  AnimatedText,
  PulseText,
  FadeIn,
  GradientText,
  TypingText,
  HoverZoom,
};

// ✅ Puis on exporte la variable
export default MotionEffects;
