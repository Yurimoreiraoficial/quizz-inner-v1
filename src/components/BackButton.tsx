import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  visible?: boolean;
}

// Posição discreta, top-left
export function BackButton({ onClick, visible = true }: BackButtonProps) {
  if (!visible) return <div className="w-9 h-9" aria-hidden />;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar"
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}
