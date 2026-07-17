import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TAB_ZONES, getTabZone } from "@/lib/layoutConstants";

// Handler global do botão voltar (hardware) no Android WebView.
// Mantém uma entrada-sentinela ("backstop") no fundo da pilha de histórico
// para que o back nativo sempre resolva via history.back() dentro do app,
// em vez de fechar o WebView (canGoBack() nunca fica false).
// Quando o back aterrissa no backstop: se a rota atual for a raiz da zona,
// permanece nela; se for uma sub-rota (deep link), sobe para a raiz da zona.
// Aditivo: não altera navegação web/desktop (só ativa em Android) nem o
// comportamento do MobileBackHeader/BottomNav.

const BACKSTOP = "__android_backstop__";
const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent || "");

export default function AndroidBackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAndroid) return;
    const here = location.pathname + location.search;

    if (location.state?.[BACKSTOP]) {
      // Aterrissou no backstop (back nativo no fim da pilha):
      // re-empilha a rota apropriada para o app não "esvaziar" o histórico.
      const zone = getTabZone(location.pathname);
      const zoneRoot = zone ? TAB_ZONES[zone][0] : "/";
      navigate(location.pathname === zoneRoot ? here : zoneRoot, { state: null });
    } else if (location.key === "default") {
      // Primeira entrada do histórico (boot/deep link): marca como backstop.
      // O effect roda de novo com o state e empilha a rota real por cima.
      navigate(here, { replace: true, state: { [BACKSTOP]: true } });
    }
  }, [location, navigate]);

  return null;
}