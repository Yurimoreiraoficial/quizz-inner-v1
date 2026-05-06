import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  as?: "section" | "div" | "article" | "footer";
}

const easeOutPremium: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.25,
  as = "section",
}: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      transition={{ duration: 0.75, ease: easeOutPremium, delay }}
    >
      {children}
    </Comp>
  );
}
