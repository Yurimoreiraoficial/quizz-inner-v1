import { useEffect } from "react";
import Index from "./Index";

/**
 * Versão DARK do funil.
 *
 * Estratégia: a página é uma cópia funcional do funil (reusa <Index/>),
 * apenas envolvendo-o em uma camada que ativa o tema dark via classe `dark`
 * no <html> enquanto a rota está ativa. Todos os tokens de design já são
 * theme-aware (definidos em src/index.css em :root e .dark), portanto o
 * funil inteiro herda a paleta sem duplicar componentes.
 *
 * Para editar a versão dark, ajuste:
 *   - Tokens: src/index.css (.dark { ... })
 *   - Tipografia serifada dos títulos: regras .dark h1, .dark h2 em src/index.css
 *   - CTA branco no dark: regra .dark .btn-primary em src/index.css
 */
const IndexDark = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => {
      root.classList.remove("dark");
    };
  }, []);

  return <Index />;
};

export default IndexDark;
