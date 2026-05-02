import { useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import type { Testimonial } from "@/data/testimonialsByMarket";
import { Star } from "lucide-react";

interface TestimonialSwipeProps {
  items: Testimonial[];
}

// Mostra 1 depoimento por vez. Swipe manual (drag horizontal). Sem auto-scroll.
export function TestimonialSwipe({ items }: TestimonialSwipeProps) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const goTo = (i: number) => setIndex(Math.max(0, Math.min(items.length - 1, i)));

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goTo(index + 1);
    else if (info.offset.x > threshold) goTo(index - 1);
  };

  const t = items[index];

  return (
    <div className="w-full" ref={containerRef}>
      <motion.div
        key={index}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        style={{ x }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
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

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para depoimento ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground uppercase tracking-widest">A escolha maiores empresas do Brasil</p>
    </div>
  );
}
