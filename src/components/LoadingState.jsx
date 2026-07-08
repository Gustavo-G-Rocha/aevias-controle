import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingState — spinner centralizado reutilizável.
 * Substitui o padrão `if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 ... /></div>`.
 *
 * @param {boolean} fullScreen - Quando true (padrão), ocupa a altura total da viewport.
 * @param {string}  size       - Classes Tailwind para o tamanho do ícone (padrão "w-8 h-8").
 * @param {string}  message    - Texto opcional exibido abaixo do spinner.
 * @param {string}  className  - Classes adicionais para o container.
 */
export default function LoadingState({
  fullScreen = true,
  size = "w-8 h-8",
  message,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col justify-center items-center gap-3 ${
        fullScreen ? "h-screen" : ""
      } ${className}`}
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <Loader2
        className={`${size} animate-spin`}
        style={{ color: "var(--color-text-subtle)" }}
      />
      {message && (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {message}
        </p>
      )}
    </div>
  );
}