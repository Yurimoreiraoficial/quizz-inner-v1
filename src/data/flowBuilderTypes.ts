/**
 * Flow Builder — tipos e constantes para o builder visual estilo Typebot.
 */

// ─── Tipos de nós do fluxo ───
export type FlowNodeType = "start" | "screen" | "ab_test" | "condition" | "checkout" | "whatsapp";

export interface FlowConnection {
  id: string;
  label?: string;
  targetNodeId: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  screenKey?: string;
  title: string;
  description?: string;
  position: { x: number; y: number };
  outputs: FlowConnection[];
}

// ─── Tipos de blocos internos de tela ───
export type ScreenBlockType =
  | "progress" | "logo" | "headline" | "subtitle" | "image" | "video"
  | "benefit_card" | "options" | "slider" | "lead_form" | "cta"
  | "result_card" | "offer_card" | "embed" | "audio" | "text";

export interface ScreenBlock {
  id: string;
  screenKey: string;
  type: ScreenBlockType;
  content: Record<string, unknown>;
  order: number;
  status: "active" | "hidden";
}

// ─── Categorias da biblioteca de blocos ───
export interface LibraryItem {
  type: string;
  label: string;
  icon: string;
  mode: "flow" | "screen";
}

export interface LibraryCategory {
  name: string;
  items: LibraryItem[];
}

export const BLOCK_LIBRARY: LibraryCategory[] = [
  {
    name: "Conteúdo",
    items: [
      { type: "text", label: "Texto", icon: "📝", mode: "screen" },
      { type: "image", label: "Imagem", icon: "🖼️", mode: "screen" },
      { type: "video", label: "Vídeo", icon: "🎬", mode: "screen" },
      { type: "audio", label: "Áudio", icon: "🔊", mode: "screen" },
      { type: "embed", label: "Embed", icon: "🧩", mode: "screen" },
    ],
  },
  {
    name: "Inputs",
    items: [
      { type: "options", label: "Seleção única", icon: "☑️", mode: "screen" },
      { type: "slider", label: "Slider", icon: "🎚️", mode: "screen" },
      { type: "lead_form", label: "Formulário", icon: "📋", mode: "screen" },
    ],
  },
  {
    name: "Funil",
    items: [
      { type: "progress", label: "Barra de progresso", icon: "📊", mode: "screen" },
      { type: "headline", label: "Headline", icon: "🔤", mode: "screen" },
      { type: "subtitle", label: "Subtítulo", icon: "💬", mode: "screen" },
      { type: "cta", label: "CTA", icon: "🔵", mode: "screen" },
      { type: "benefit_card", label: "Card de benefício", icon: "✨", mode: "screen" },
      { type: "result_card", label: "Resultado", icon: "🏆", mode: "screen" },
      { type: "offer_card", label: "Oferta", icon: "💰", mode: "screen" },
      { type: "logo", label: "Logo", icon: "🅰️", mode: "screen" },
    ],
  },
  {
    name: "Lógica",
    items: [
      { type: "screen", label: "Nova tela", icon: "📱", mode: "flow" },
      { type: "condition", label: "Condição", icon: "🔀", mode: "flow" },
      { type: "ab_test", label: "Teste A/B", icon: "🧪", mode: "flow" },
      { type: "whatsapp", label: "WhatsApp", icon: "💬", mode: "flow" },
      { type: "checkout", label: "Checkout", icon: "💳", mode: "flow" },
    ],
  },
];

// ─── Cores por tipo de nó do fluxo ───
export const NODE_COLORS: Record<FlowNodeType, string> = {
  start: "#3b82f6",
  screen: "#6366f1",
  ab_test: "#a855f7",
  condition: "#f59e0b",
  checkout: "#22c55e",
  whatsapp: "#25d366",
};

export const NODE_LABELS: Record<FlowNodeType, string> = {
  start: "Início",
  screen: "Tela",
  ab_test: "Teste A/B",
  condition: "Condição",
  checkout: "Checkout",
  whatsapp: "WhatsApp",
};
