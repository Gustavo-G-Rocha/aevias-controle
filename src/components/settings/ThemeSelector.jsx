import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/utils/themeStorage";

const OPTIONS = [
  { value: THEMES.LIGHT, label: "Claro", description: "Tema claro", Icon: Sun },
  { value: THEMES.DARK, label: "Escuro", description: "Tema escuro", Icon: Moon },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-3">
      {OPTIONS.map(({ value, label, description, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className="flex items-center gap-3 p-4 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              borderColor: active ? "var(--color-secondary)" : "var(--color-border)",
              backgroundColor: active
                ? "var(--color-secondary-subtle)"
                : "var(--color-surface-muted)",
            }}
          >
            <div className="p-3 rounded-full" style={{ backgroundColor: "var(--color-primary)" }}>
              <Icon className="w-6 h-6" style={{ color: "var(--color-secondary)" }} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>
                {active ? `${description} ativo` : description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}