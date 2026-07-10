import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/290985b58_AE-LogoHorPrincipal_2.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Sempre mostra sucesso, independentemente do resultado
    } finally {
      setLoading(false);
      setSent(true);
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
            Recuperar senha
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-sidebar-text-muted)" }}
          >
            Enviaremos um link para redefini-la
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
          {sent ? (
            <p
              className="text-sm text-center"
              style={{ color: "var(--color-text)" }}
            >
              Se existir uma conta com esse e-mail, você receberá um link de recuperação de senha em breve.
            </p>
          ) : (
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
                    placeholder="seu@afirmaevias.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar link de recuperação
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-sidebar-text-muted)" }}
        >
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--color-secondary)" }}
          >
            <ArrowLeft className="w-3 h-3 inline mr-1" />
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}