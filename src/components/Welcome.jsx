import { useEffect } from "react";
import { motion } from "framer-motion";
import './WelcomeScreen.css';

const letters = ["A", "l", "g", "o", "r", "a"];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const letter = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const Welcome = ({ onFinish }) => {
  // ✅ Llama a onFinish después de 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onFinish === "function") {
        onFinish();
      }
    }, 2500); // puedes ajustar el tiempo si quieres que dure más o menos

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcome-container">
      <motion.img
        src="/assets/algora.jpg"
        alt="Algora"
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="welcome-logo"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="welcome-title"
      >
        {letters.map((char, index) => (
          <motion.span key={index} variants={letter}>
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default Welcome;
