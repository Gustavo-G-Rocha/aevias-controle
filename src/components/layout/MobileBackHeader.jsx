import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPageTitle } from "@/lib/pageTitles";

// Rotas raiz (tabs do BottomNav) — não mostram botão voltar
const ROOT_PATHS = ["/", "/Regionais", "/Projects", "/MeusEnsaios"];

export default function MobileBackHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRoot = ROOT_PATHS.includes(location.pathname);
  const title = getPageTitle(location.pathname);
  if (isRoot) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="lg:hidden sticky top-0 z-30 flex items-center gap-2 px-2 py-1.5"
      style={{
        backgroundColor: "var(--color-sidebar-bg)",
        borderBottom: "1px solid var(--color-sidebar-border)",
        paddingTop: "calc(env(safe-area-inset-top) + 0.375rem)",
      }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium select-none"
        style={{ color: "var(--color-sidebar-text)" }}
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: "var(--color-sidebar-icon)" }} />
        Voltar
      </button>
      {title && (
        <span
          className="flex-1 truncate pr-2 text-sm font-semibold text-right"
          style={{ color: "var(--color-sidebar-text)" }}
        >
          {title}
        </span>
      )}
    </div>
  );
}