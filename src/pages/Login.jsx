import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/66ca39c89_AfirmaE-vias-Logoprincipal.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

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
            Bem-vindo de volta
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-sidebar-text-muted)" }}
          >
            Acesse sua conta para continuar
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
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-subtle)" }}
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: "var(--color-primary)" }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-subtle)" }}
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-sidebar-text-muted)" }}
        >
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="font-medium hover:underline"
            style={{ color: "var(--color-secondary)" }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}