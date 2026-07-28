import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare } from "lucide-react";

/**
 * Caixa de resposta do admin + avaliação (5 estrelas) do solicitante.
 * Exibida abaixo de cada chamado no ReportarErro.
 */
export default function RespostaAvaliacao({
  report,
  isAdmin,
  currentUserEmail,
  respostaMutation,
  avaliacaoMutation,
  formatDate,
  StarRating,
}) {
  const [resposta, setResposta] = useState(report.resposta_admin || "");

  useEffect(() => {
    setResposta(report.resposta_admin || "");
  }, [report.resposta_admin]);

  const isOwner = report.created_by === currentUserEmail;
  const savingResposta = respostaMutation.isPending;
  const savingAvaliacao = avaliacaoMutation.isPending;

  const handleSaveResposta = () => {
    if (!resposta.trim()) return;
    respostaMutation.mutate({ reportId: report.id, resposta_admin: resposta.trim() });
  };

  const handleAvaliacao = (n) => {
    avaliacaoMutation.mutate({ reportId: report.id, avaliacao: n });
  };

  const temResposta = !!report.resposta_admin;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
      {/* Resposta do admin (visível para solicitante e admin) */}
      {temResposta && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">
              Resposta do suporte
            </span>
            {report.resposta_admin_date && (
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDate(report.resposta_admin_date)}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {report.resposta_admin}
          </p>
        </div>
      )}

      {/* Caixa para o admin escrever a resposta */}
      {isAdmin && (
        <div>
          <label className="text-xs font-medium text-slate-700">
            {temResposta ? "Editar resposta ao solicitante" : "Responder ao solicitante"}
          </label>
          <Textarea
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            rows={3}
            placeholder="Escreva a resolução do chamado que será enviada ao usuário..."
            className="mt-1"
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleSaveResposta}
              disabled={savingResposta || !resposta.trim()}
            >
              {savingResposta ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
              )}
              {temResposta ? "Atualizar resposta" : "Enviar resposta"}
            </Button>
          </div>
        </div>
      )}

      {/* Avaliação do solicitante — só o dono do chamado, e só depois que há resposta */}
      {isOwner && temResposta && (
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Avalie o suporte recebido
              </p>
              <p className="text-xs text-muted-foreground">
                {report.avaliacao
                  ? `Você avaliou em ${formatDate(report.avaliacao_date)}`
                  : "Toque nas estrelas para classificar de 1 a 5"}
              </p>
            </div>
            <StarRating
              value={report.avaliacao || 0}
              onChange={handleAvaliacao}
              readOnly={savingAvaliacao || !!report.avaliacao}
            />
          </div>
          {savingAvaliacao && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando avaliação...
            </div>
          )}
        </div>
      )}

      {/* Admin vê a avaliação dada pelo usuário */}
      {isAdmin && report.avaliacao && (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">Avaliação do solicitante:</span>
          <StarRating value={report.avaliacao} readOnly size="w-4 h-4" />
          <span className="text-muted-foreground">
            ({report.avaliacao}/5)
          </span>
        </div>
      )}
    </div>
  );
}