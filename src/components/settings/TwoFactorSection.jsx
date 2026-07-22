import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, ShieldOff, Copy, KeyRound } from 'lucide-react';
import { gerenciarDoisFatores } from '@/functions/gerenciarDoisFatores';
import { toast } from '@/components/ui/use-toast';

/**
 * Seção de Autenticação em Duas Etapas (TOTP) para a página de Configurações.
 * Fluxos: ativação (enrollment), exibição única de códigos de recuperação e desativação.
 * O segredo é exibido apenas para digitação manual no app autenticador —
 * não é enviado a serviços externos de QR (evita vazamento do segredo).
 */
export default function TwoFactorSection() {
  const [view, setView] = useState('loading'); // loading | disabled | setup | recovery | active
  const [status, setStatus] = useState(null);
  const [setupData, setSetupData] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [activationCode, setActivationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [busy, setBusy] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await gerenciarDoisFatores({ action: 'status' });
      setStatus(res.data);
      setView(res.data?.enabled ? 'active' : 'disabled');
    } catch {
      setView('disabled');
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleStartSetup = async () => {
    setBusy(true);
    try {
      const res = await gerenciarDoisFatores({ action: 'setup' });
      setSetupData(res.data);
      setActivationCode('');
      setView('setup');
    } catch (err) {
      toast({ title: err?.response?.data?.error || 'Erro ao iniciar ativação.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleActivate = async () => {
    if (!activationCode.trim()) return;
    setBusy(true);
    try {
      const res = await gerenciarDoisFatores({ action: 'activate', code: activationCode.trim() });
      setRecoveryCodes(res.data?.recoveryCodes || []);
      setView('recovery');
      toast({ title: 'Autenticação em duas etapas ativada!' });
    } catch (err) {
      toast({ title: err?.response?.data?.error || 'Código incorreto.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!disableCode.trim()) return;
    setBusy(true);
    try {
      await gerenciarDoisFatores({ action: 'disable', code: disableCode.trim() });
      sessionStorage.removeItem('twofactor_session_verified');
      setDisableCode('');
      toast({ title: 'Autenticação em duas etapas desativada.' });
      await loadStatus();
    } catch (err) {
      toast({ title: err?.response?.data?.error || 'Código incorreto.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const copyCodes = () => {
    navigator.clipboard?.writeText(recoveryCodes.join('\n'));
    toast({ title: 'Códigos copiados. Guarde-os em local seguro.' });
  };

  const formattedSecret = setupData?.secret
    ? setupData.secret.match(/.{1,4}/g).join(' ')
    : '';

  if (view === 'loading') {
    return <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>;
  }

  if (view === 'disabled') {
    return (
      <div className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Adicione uma camada extra de segurança exigindo um código do seu app autenticador
          (Google Authenticator, Microsoft Authenticator, Authy) no login e nas assinaturas eletrônicas.
        </p>
        <Button onClick={handleStartSetup} disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Ativar autenticação em duas etapas
        </Button>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>
            <strong>1.</strong> Abra seu app autenticador e adicione uma conta manualmente
            (&quot;Inserir chave de configuração&quot;) com esta chave:
          </p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono px-2 py-1.5 rounded border select-all break-all" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              {formattedSecret}
            </code>
            <Button variant="outline" size="sm" className="h-8 flex-shrink-0" onClick={() => {
              navigator.clipboard?.writeText(setupData.secret);
              toast({ title: 'Chave copiada.' });
            }}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Tipo: baseado em tempo (TOTP) · Conta: AfirmaEvias QA
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tf-activation" className="text-sm"><strong>2.</strong> Digite o código de 6 dígitos gerado pelo app:</Label>
          <div className="flex gap-2">
            <Input
              id="tf-activation"
              inputMode="numeric"
              maxLength={6}
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && !busy && handleActivate()}
              placeholder="000000"
              className="max-w-[140px] font-mono tracking-widest"
            />
            <Button onClick={handleActivate} disabled={busy || activationCode.length !== 6}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
            </Button>
            <Button variant="outline" onClick={() => setView('disabled')} disabled={busy}>Cancelar</Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'recovery') {
    return (
      <div className="space-y-3">
        <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--color-warning-bg)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Guarde seus códigos de recuperação — eles são exibidos apenas agora.
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Se perder o acesso ao app autenticador, cada código abaixo pode ser usado uma única vez no lugar do código de 6 dígitos.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {recoveryCodes.map((c) => (
              <code key={c} className="text-xs font-mono px-2 py-1 rounded border text-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>{c}</code>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyCodes} className="gap-1.5">
            <Copy className="w-4 h-4" /> Copiar códigos
          </Button>
          <Button onClick={loadStatus} className="gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Salvei meus códigos
          </Button>
        </div>
      </div>
    );
  }

  // view === 'active'
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> Ativa
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {status?.recoveryCodesRemaining ?? 0} código(s) de recuperação restante(s)
        </span>
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Um código do app autenticador será exigido ao entrar no sistema e ao assinar documentos eletronicamente.
      </p>
      <div className="space-y-2">
        <Label htmlFor="tf-disable" className="flex items-center gap-1.5 text-sm">
          <KeyRound className="w-3.5 h-3.5" />
          Para desativar, informe um código válido (autenticador ou recuperação):
        </Label>
        <div className="flex gap-2">
          <Input
            id="tf-disable"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            placeholder="Código"
            className="max-w-[180px] font-mono"
          />
          <Button variant="destructive" onClick={handleDisable} disabled={busy || !disableCode.trim()} className="gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
            Desativar
          </Button>
        </div>
      </div>
    </div>
  );
}