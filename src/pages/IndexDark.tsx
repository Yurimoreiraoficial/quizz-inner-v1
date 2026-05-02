import { useLayoutEffect } from "react";
import Index from "./Index";

/**
 * Versão DARK do funil.
 *
 * Reusa <Index/> e ativa o tema dark adicionando a classe `dark` no <html>.
 * Usamos useLayoutEffect para aplicar/remover a classe de forma síncrona,
 * antes do paint, evitando race conditions com a fase de commit do React
 * que podem causar erros de "removeChild" durante navegação entre rotas.
 *
 * O cleanup só remove a classe se esta instância foi quem adicionou,
 * para não interferir com outros consumidores do tema.
 */
const IndexDark = () => {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    if (!hadDark) root.classList.add("dark");
    return () => {
      if (!hadDark) root.classList.remove("dark");
    };
  }, []);

  return <Index />;
};

export default IndexDark;
