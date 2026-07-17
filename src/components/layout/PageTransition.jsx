import React from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Transição de página estilo nativo:
// - Mobile (<1024px): slide horizontal — PUSH desliza da direita (avançar),
//   POP desliza da esquerda (voltar), como pilhas de navegação iOS/Android.
// - Desktop: mantém o fade suave original (comportamento web preservado).
// Modais e drawers não passam por aqui — mantêm suas próprias animações.
const VARIANTS = {
  push: { initial: { x: "100%", opacity: 1 }, animate: { x: 0, opacity: 1 } },
  pop:  { initial: { x: "-30%", opacity: 0.4 }, animate: { x: 0, opacity: 1 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
};

const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;

export default function PageTransition({ children, ...divProps }) {
  const location = useLocation();
  const navigationType = useNavigationType();

  const mode = !isMobileViewport() ? "fade" : navigationType === "POP" ? "pop" : "push";
  const variant = VARIANTS[mode];
  const transition = mode === "fade"
    ? { duration: 0.25, ease: "easeOut" }
    : { type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] };

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        initial={variant.initial}
        animate={variant.animate}
        transition={transition}
        {...divProps}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}