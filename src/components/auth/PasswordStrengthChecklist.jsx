import React from "react";
import { Check, X } from "lucide-react";
import { getPasswordCriteria, getPasswordStrength } from "@/utils/passwordPolicy";

const STRENGTH_LABELS = ["Muito fraca", "Fraca", "Média", "Boa", "Muito forte"];
const STRENGTH_COLORS = ["#DC2626", "#DC2626", "#D97706", "#16A34A", "#16A34A"];

/**
 * Checklist visual de critérios de senha + barra de força.
 * Mostra feedback em tempo real enquanto o usuário digita.
 */
export default function PasswordStrengthChecklist({ password, email = "" }) {
  const criteria = getPasswordCriteria(password, email);
  const strength = getPasswordStrength(password);
  const unmet = criteria.filter((c) => !c.met);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de força */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: i < strength ? STRENGTH_COLORS[strength] : "var(--color-border)",
              }}
            />
          ))}
        </div>
        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: STRENGTH_COLORS[strength] }}
        >
          {STRENGTH_LABELS[strength]}
        </span>
      </div>

      {/* Checklist de critérios */}
      <ul className="space-y-1">
        {criteria.map((c) => (
          <li key={c.key} className="flex items-center gap-1.5 text-xs">
            {c.met ? (
              <Check className="w-3 h-3 shrink-0" style={{ color: "var(--color-success)" }} />
            ) : (
              <X className="w-3 h-3 shrink-0" style={{ color: "var(--color-text-subtle)" }} />
            )}
            <span
              style={{
                color: c.met ? "var(--color-text-muted)" : "var(--color-text-subtle)",
                textDecoration: c.met ? "none" : "none",
              }}
            >
              {c.label}
            </span>
          </li>
        ))}
      </ul>

      {unmet.length > 0 && (
        <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
          {unmet.length} critério(s) restante(s) para uma senha válida.
        </p>
      )}
    </div>
  );
}