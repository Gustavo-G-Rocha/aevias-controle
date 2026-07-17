import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import { validatePasswordComplexity } from "@/utils/passwordPolicy";
import PasswordStrengthChecklist from "@/components/auth/PasswordStrengthChecklist";
import { logPasswordReset } from "@/utils/auditEvents";

const LOGO_URL = "https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/290985b58_AE-LogoHorPrincipal_2.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    const { valid, errors } = validatePasswordComplexity(newPassword);
    if (!valid) {
      setError(errors.join(" "));
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      logPasswordReset();
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Falha ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={LOGO_URL}
              alt="Afirma Evias"
              className="h-16 mx-auto mb-4 object-contain"
            />
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--color-sidebar-text)", fontFamily: "var(--font-heading)" }}
            >
              Link inválido
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-sidebar-text-muted)" }}
            >
              Este link de recuperação está ausente ou é inválido
            </p>
          </div>

          <div
            className="rounded-2xl border p-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <p
              className="text-sm text-center"
              style={{ color: "var(--color-text)" }}
            >
              O link utilizado parece estar incompleto. Solicite um novo e-mail de recuperação de senha.
            </p>
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--color-sidebar-text-muted)" }}
          >
            <Link
              to="/forgot-password"
              className="font-medium hover:underline"
              style={{ color: "var(--color-secondary)" }}
            >
              Solicitar novo link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={LOGO_URL}
            alt="Afirma Evias"
            className="h-16 mx-auto mb-4 object-contain"
          />
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-sidebar-text)", fontFamily: "var(--font-heading)" }}
          >
            Nova senha
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-sidebar-text-muted)" }}
          >
            Digite sua nova senha abaixo
          </p>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--color-danger-bg)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-subtle)" }}
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <PasswordStrengthChecklist password={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-subtle)" }}
                  aria-hidden="true"
                />
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Redefinir senha
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}