import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { validatePasswordComplexity } from "@/utils/passwordPolicy";
import PasswordStrengthChecklist from "@/components/auth/PasswordStrengthChecklist";
import { safeReturnTo } from "@/lib/authReturnTo";

const LOGO_URL = "https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/290985b58_AE-LogoHorPrincipal_2.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    const { valid, errors } = validatePasswordComplexity(password, email);
    if (!valid) {
      setError(errors.join(" "));
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Código de verificação inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Código enviado",
        description: "Verifique seu e-mail para o novo código.",
      });
    } catch (err) {
      setError(err.message || "Falha ao reenviar código");
    }
  };

  if (showOtp) {
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
              Verifique seu e-mail
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-sidebar-text-muted)" }}
            >
              Enviamos um código para {email}
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

            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                autoFocus
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full h-12 font-medium"
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>

            <p
              className="text-center text-sm mt-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              Não recebeu o código?{" "}
              <button
                onClick={handleResend}
                className="font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Reenviar
              </button>
            </p>
          </div>
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
            Criar conta
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-sidebar-text-muted)" }}
          >
            Cadastre-se para começar
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
                  placeholder="seu@afirmaevias.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <PasswordStrengthChecklist password={password} email={email} />
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
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar conta
                </>
              )}
            </Button>
          </form>
        </div>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-sidebar-text-muted)" }}
        >
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: "var(--color-secondary)" }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}