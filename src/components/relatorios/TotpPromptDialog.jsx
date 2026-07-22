import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, KeyRound } from 'lucide-react';

/**
 * Diálogo de step-up authentication (2FA) para o ato de assinatura.
 * Exibido quando o backend exige código TOTP do aprovador.
 */
export default function TotpPromptDialog({ open, onClose, onConfirm }) {
  const [code, setCode] = useState('');

  const handleConfirm = () => {
    if (!code.trim()) return;
    const value = code.trim();
    setCode('');
    onConfirm(value);
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-200">
              <KeyRound className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Verificação em duas etapas</DialogTitle>
              <DialogDescription className="text-sm">
                Assinatura exige código 2FA
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && code.trim() && handleConfirm()}
            placeholder="Código do autenticador ou de recuperação"
            className="text-center font-mono"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!code.trim()} className="bg-blue-600 text-white hover:bg-blue-700 gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}