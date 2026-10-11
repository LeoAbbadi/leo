import { motion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Céu atrás do site inteiro. Rolar a página é passar o dia:
 * começa de manhã e termina no pôr do sol (no tema escuro, da noite para a madrugada).
 * Os dois sóis da marca descem devagar com a rolagem, e é esse fundo vivo que o
 * vidro líquido refrata.
 */
export function Sky() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 0.6 });
  const dusk = useTransform(p, [0, 0.15, 1], [0, 0, 1]);
  const sunY = useTransform(p, [0, 1], ["0vh", "55vh"]);
  const seaY = useTransform(p, [0, 1], ["0vh", "35vh"]);
  const sunX = useTransform(p, [0, 1], ["0vw", "8vw"]);
  const seaX = useTransform(p, [0, 1], ["0vw", "-6vw"]);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-layer sky-morning" />
      <motion.div className="sky-layer sky-dusk" style={{ opacity: dusk }} />
      <div className="sky-stars" />
      <motion.div className="sky-orb sky-orb-sun" style={{ y: sunY, x: sunX }} />
      <motion.div className="sky-orb sky-orb-sea" style={{ y: seaY, x: seaX }} />
      <div className="sky-cloud sky-cloud-1" />
      <div className="sky-cloud sky-cloud-2" />
      <div className="sky-cloud sky-cloud-3" />
      <div className="sky-grain" />
    </div>
  );
}
