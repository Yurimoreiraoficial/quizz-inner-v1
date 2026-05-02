import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import type { Testimonial } from "@/data/testimonialsByMarket";
import { Star } from "lucide-react";

interface TestimonialSwipeProps {
  items: Testimonial[];
}

const AUTO_ROTATE_MS = 4000;

// Mostra 1 depoimento por vez. Auto-rotaciona a cada 4s com slide da direita p/ esquerda.
// Permite swipe manual (drag) — ao interagir, pausa a rotação automática.
export function TestimonialSwipe({ items }: TestimonialSwipeProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const goTo = (i: number) => {
    const total = items.length;
    setIndex(((i % total) + total) % total);
  };

  // Auto-rotate
  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, items.length]);

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goTo(index + 1);
    else if (info.offset.x > threshold) goTo(index - 1);
    // retoma após pequena pausa
    window.setTimeout(() => setPaused(false), 1500);
  };

  const t = items[index];

  return (
    <div
      className="w-full"
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setPaused(true)}
            onDragEnd={onDragEnd}
            style={{ x }}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="card-surface p-5 sm:p-6 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-1 mb-3 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-[15px] leading-relaxed text-foreground text-pretty">"{t.text}"</p>
            <div className="mt-4 text-sm">
              <div className="font-semibold text-foreground">{t.name}</div>
              <div className="text-muted-foreground">{t.role}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para depoimento ${i + 1}`}
            onClick={() => { setPaused(true); goTo(i); window.setTimeout(() => setPaused(false), 1500); }}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground uppercase tracking-widest">A escolha maiores empresas do Brasil</p>
    </div>
  );
}
