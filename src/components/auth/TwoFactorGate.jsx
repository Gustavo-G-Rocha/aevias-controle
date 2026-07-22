import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Loader2, LogOut } from 'lucide-react';
import { gerenciarDoisFatores } from '@/functions/gerenciarDoisFatores';
import { base44 } from '@/api/base44Client';
import LoadingState from '@/components/LoadingState';

const SESSION_KEY = 'twofactor_session_verified';

/**
 * Gate de 2FA pós-login (layout route).
 * Usuários com 2FA ativo precisam informar um código TOTP (ou de recuperação)
 * uma vez por sessão do navegador.
 *
 * Offline (degradação segura): sem conexão o desafio não é exibido — o app
 * offline-first continua utilizável; assinaturas eletrônicas continuam
 * exigindo 2FA server-side quando a conexão voltar.
 */
export default function TwoFactorGate() {
  const [state, setState] = useState('checking'); // checking | ok | challenge
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') { setState('ok'); return; }
    if (!navigator.onLine) { setState('ok'); return; }
    let cancelled = false;
    gerenciarDoisFatores({ action: 'status' })
      .then((res) => {
        if (cancelled) return;
        if (res?.data?.enabled) {
          setState('challenge');
        } else {
          sessionStorage.setItem(SESSION_KEY, '1');
          setState('ok');
        }
      })
      .catch(() => { if (!cancelled) setState('ok'); });
    return () => { cancelled = true; };
  }, []);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setError('');
    try {
      await gerenciarDoisFatores({ action: 'verify', code: code.trim() });
      sessionStorage.setItem(SESSION_KEY, '1');
      setState('ok');
    } catch (err) {
      setError(err?.response?.data?.error || 'Código incorreto. Tente novamente.');
    } finally {
      setVerifying(false);
    }
  };

  if (state === 'ok') return <Outlet />;
  if (state === 'checking') return <LoadingState />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--color-info-bg)' }}>
            <ShieldCheck className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
          </div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Verificação em duas etapas</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Digite o código do seu app autenticador ou um código de recuperação.
          </p>
        </div>

        <div className="space-y-2">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !verifying && handleVerify()}
            placeholder="Código de 6 dígitos"
            className="text-center font-mono tracking-widest"
            autoFocus
            disabled={verifying}
          />
          {error && <p className="text-xs text-red-600 font-medium text-center">{error}</p>}
        </div>

        <Button className="w-full gap-1.5" onClick={handleVerify} disabled={verifying || !code.trim()}>
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Verificar
        </Button>

        <button
          type="button"
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center justify-center gap-1.5 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <LogOut className="w-3.5 h-3.5" /> Sair da conta
        </button>
      </div>
    </div>
  );
}