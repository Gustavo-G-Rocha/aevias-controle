import React, { useState, useEffect } from 'react';
import { gerenciarDoisFatores } from '@/functions/gerenciarDoisFatores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Loader2, AlertTriangle, KeyRound } from "lucide-react";

/**
 * SignatureReauthModal — Modal de reautenticação para assinatura eletrônica.
 *
 * Este NÃO é um simples clique de "aprovar" — é o momento da assinatura.
 * O usuário deve digitar sua senha para provar intenção deliberada de
 * assinar (Lei 14.063/2020). A sessão ativa sozinha não é aceita.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onConfirm: (password: string) => Promise<void>
 *   signerName: string
 *   documentDescription: string
 *   loading: boolean
 *   error?: string
 */
export default function SignatureReauthModal({
  open,
  onClose,
  onConfirm,
  signerName,
  documentDescription,
  loading = false,
  error = '',
}) {
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);

  // Step-up authentication: se o signatário tem 2FA ativo,
  // o código do autenticador também é exigido no ato da assinatura.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    gerenciarDoisFatores({ action: 'status' })
      .then((res) => { if (!cancelled) setTotpRequired(!!res?.data?.enabled); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [open]);

  const handleConfirm = async () => {
    if (!password.trim()) return;
    if (totpRequired && !totpCode.trim()) return;
    await onConfirm(password, totpCode.trim() || undefined);
  };

  const handleClose = () => {
    setPassword('');
    setTotpCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-200">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Assinatura Eletrônica</DialogTitle>
              <DialogDescription className="text-sm">
                Ato formal de assinatura — Lei 14.063/2020
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Aviso de ato deliberado */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Você está prestes a <strong>assinar eletronicamente</strong> este documento.
              Esta ação tem valor probatório e não pode ser desfeita sem reprovação explícita.
              Confirme sua senha para provar intenção deliberada de assinar.
            </p>
          </div>

          {/* Informações do signatário */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Signatário:</span>
              <span className="font-medium text-slate-700">{signerName || '—'}</span>
            </div>
            {documentDescription && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Documento:</span>
                <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">
                  {documentDescription}
                </span>
              </div>
            )}
          </div>

          {/* Campo de senha */}
          <div className="space-y-2">
            <Label htmlFor="reauth-password" className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Confirme sua senha para assinar
            </Label>
            <Input
              id="reauth-password"
              type="text"
              style={{ WebkitTextSecurity: 'disc' }}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && password && handleConfirm()}
              placeholder="Digite sua senha..."
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}
          </div>

          {totpRequired && (
            <div className="space-y-2">
              <Label htmlFor="reauth-totp" className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Código do app autenticador (2FA)
              </Label>
              <Input
                id="reauth-totp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && password && totpCode && handleConfirm()}
                placeholder="Código de 6 dígitos ou de recuperação"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !password.trim() || (totpRequired && !totpCode.trim())}
            className="bg-blue-600 text-white hover:bg-blue-700 gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Confirmar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}