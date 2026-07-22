import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Clock, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { obterRegistro } from "@/services/recordsService";
import { gerenciarAprovacao } from "@/functions/gerenciarAprovacao";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';
import IntegrityBanner from "@/components/relatorios/IntegrityBanner";
import TotpPromptDialog from "@/components/relatorios/TotpPromptDialog";
import SignatureSeal from "@/components/relatorios/SignatureSeal";
import { isSupervisorInRegional } from "@/utils/accessControl";

// Props:
//   entityName: string (e.g. "ChecklistConcretagem")
//   recordId: string
export default function AprovacaoBar({ entityName, recordId }) {
  const [user, setUser] = useState(null);
  const [record, setRecord] = useState(null);
  const [regional, setRegional] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [signature, setSignature] = useState(null);
  const [actionError, setActionError] = useState('');
  const [showTotpDialog, setShowTotpDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        logger.error('AprovacaoBar: erro ao carregar usuário', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!entityName || !recordId) return;
    const loadRecord = async () => {
      try {
        const data = await obterRegistro(entityName, recordId);
        setRecord(data);
        // Carrega obra → regional para verificação de supervisor
        if (data?.obra_id) {
          try {
            const obra = await base44.entities.Obra.get(data.obra_id);
            if (obra?.regional_id) {
              const reg = await base44.entities.Regional.get(obra.regional_id);
              setRegional(reg);
            }
          } catch (e) {
            logger.error('AprovacaoBar: erro ao carregar regional', e);
          }
        }
      } catch (err) {
        logger.error('AprovacaoBar: erro ao carregar registro', err);
      }
    };
    loadRecord();
  }, [entityName, recordId]);

  if (!user || !record) return null;

  // Verifica se pode aprovar/reprovar neste registro específico.
  // Para cliente_supervisor: só se for supervisor na regional do registro.
  const canApprove = isSupervisorInRegional(user, regional);



  const isPending = (record.approved === null || record.approved === undefined) && record.status !== 'rascunho';
  const isApproved = record.approved === true;
  const isRejected = record.approved === false;

  const handleApprove = async (totpCode = null) => {
    const previousRecord = record;
    setActionError('');
    setSaving(true);
    setRecord(prev => ({
      ...prev,
      approved: true,
      approved_date: new Date().toISOString(),
      approved_by: user?.email,
    }));

    try {
      const response = await Promise.race([
        gerenciarAprovacao({
          action: 'approve',
          entityName,
          recordId,
          ...(totpCode ? { totpCode } : {}),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('O servidor não respondeu. A aprovação foi desfeita.')), 15000)
        ),
      ]);
      const result = response.data.data;
      const updatedRecord = result.record || result;
      setRecord(prev => ({ ...prev, ...updatedRecord }));
      setSignature(result.signature || null);
      toast({ title: 'Documento assinado eletronicamente!' });
    } catch (err) {
      setRecord(previousRecord);
      setSignature(null);
      // Step-up 2FA: backend exige código do autenticador para assinar
      if (err?.response?.data?.errorCategory === 'totp_required') {
        setShowTotpDialog(true);
        return;
      }
      const errMsg = err?.response?.data?.error || err?.message || 'Erro ao assinar documento.';
      setActionError(errMsg);
      logger.error('[AprovacaoBar] Erro ao assinar:', errMsg);
      toast({ title: errMsg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Informe o motivo da reprovação.', variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await gerenciarAprovacao({
        action: 'reject',
        entityName,
        recordId,
        rejectionReason,
      });
      setRecord(prev => ({ ...prev, approved: false, rejection_reason: rejectionReason }));
      setShowRejectModal(false);
      setRejectionReason('');
      toast({ title: 'Registro reprovado.' });
    } catch (err) {
      logger.error('[AprovacaoBar] Erro ao reprovar registro:', err?.message || err);
      toast({ title: err?.response?.data?.error || 'Erro ao reprovar registro.', variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = () => {
    if (record.status === 'rascunho') return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
        Em execução
      </span>
    );
    if (isApproved) return (
      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3.5 h-3.5" /> Aprovado
      </span>
    );
    if (isRejected) return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
        <XCircle className="w-3.5 h-3.5" /> Reprovado
      </span>
    );
    if (isPending) return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
        <Clock className="w-3.5 h-3.5" /> Pendente
      </span>
    );
    return null;
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {statusBadge()}

        <Button size="sm" variant="outline" asChild className="h-8 gap-1">
          <Link to={`/historico-auditoria?entity_name=${entityName}&entity_id=${recordId}`}>
            <History className="w-3.5 h-3.5" />
            Histórico
          </Link>
        </Button>

        {isApproved && <IntegrityBanner record={record} />}

        {canApprove && isPending && (
          <>
            <Button size="sm" onClick={() => handleApprove()} disabled={saving}
              className="bg-green-700 text-white hover:bg-green-800 gap-1 h-8">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Aprovar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowRejectModal(true)} disabled={saving}
              className="gap-1 h-8">
              <XCircle className="w-3.5 h-3.5" />
              Reprovar
            </Button>
          </>
        )}
        {canApprove && isRejected && (
          <Button size="sm" onClick={() => handleApprove()} disabled={saving}
            className="bg-green-700 text-white hover:bg-green-800 gap-1 h-8">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Aprovar mesmo assim
          </Button>
        )}
      </div>

      {actionError && (
        <p role="alert" className="mt-2 max-w-md text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {actionError}
        </p>
      )}

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reprovar Registro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Motivo da reprovação *</Label>
            <Textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Descreva o motivo da reprovação..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Confirmar Reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isApproved && (
        <SignatureSeal
          signature={signature || (record.approver_details ? {
            signed_by_name: record.approver_details.name,
            signed_by_role: record.approver_details.position,
            signed_by_crea: record.approver_details.crea_number,
            signed_at: record.approved_date,
            signature_hash: record.approver_details.integrity_hash,
            signature_method: record.approver_details.signature_method,
          } : null)}
          compact
        />
      )}

      <TotpPromptDialog
        open={showTotpDialog}
        onClose={() => setShowTotpDialog(false)}
        onConfirm={(code) => {
          setShowTotpDialog(false);
          handleApprove(code);
        }}
      />
    </>
  );
}