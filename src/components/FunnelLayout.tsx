import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { BackButton } from "./BackButton";
import { ProgressBar } from "./ProgressBar";
import { Footer } from "./Footer";

interface FunnelLayoutProps {
  stepKey: string;
  showBack?: boolean;
  showProgress?: boolean;
  progress: number;
  onBack: () => void;
  children: ReactNode;
  scrollable?: boolean;
}

export function FunnelLayout({
  stepKey, showBack = true, showProgress = true, progress, onBack, children, scrollable = false,
}: FunnelLayoutProps) {
  return (
    <div className={scrollable ? "min-h-[100dvh]" : "min-h-[100dvh] flex flex-col"}>
      <div className="funnel-shell pt-4 sm:pt-5">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} visible={showBack} />
          <div className="flex-1 flex justify-center -ml-9">
            <Logo />
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} visible={showProgress} />
        </div>
      </div>

      <main className={scrollable ? "funnel-shell pt-6 pb-2" : "funnel-shell pt-6 pb-2 flex-1 flex flex-col"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={scrollable ? "" : "flex-1 flex flex-col"}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="funnel-shell">
        <Footer />
      </div>
    </div>
  );
}
