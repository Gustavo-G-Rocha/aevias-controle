import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SolicitarTransferenciaRegionalModal({ 
  isOpen, 
  onClose, 
  user, 
  regionalAtual,
  todasRegionais,
  onSuccess 
}) {
  const [regionalDestinoId, setRegionalDestinoId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!regionalDestinoId || !motivo.trim()) {
      alert("Por favor, selecione a regional de destino e informe o motivo.");
      return;
    }

    if (regionalDestinoId === regionalAtual.id) {
      alert("A regional de destino não pode ser a mesma da atual.");
      return;
    }

    setLoading(true);
    try {
      const regionalDestino = todasRegionais.find(r => r.id === regionalDestinoId);
      
      await base44.entities.SolicitacaoTransferenciaRegional.create({
        laboratorista_email: user.email,
        laboratorista_name: user.full_name,
        regional_atual_id: regionalAtual.id,
        regional_atual_nome: regionalAtual.nome,
        regional_destino_id: regionalDestinoId,
        regional_destino_nome: regionalDestino.nome,
        motivo: motivo.trim(),
        status: "pendente"
      });

      alert("Solicitação enviada com sucesso! Aguarde a aprovação do gestor ou sala técnica.");
      setRegionalDestinoId("");
      setMotivo("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar regionais disponíveis (excluir a atual e mostrar apenas ativas)
  const regionaisDisponiveis = todasRegionais.filter(r => 
    r.id !== regionalAtual?.id && r.status === 'ativa'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ArrowRightLeft className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="break-words">Solicitar Troca de Regional</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Regional Atual */}
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground text-sm sm:text-base">Regional Atual:</span>
            </div>
            <p className="text-foreground ml-6 text-sm sm:text-base break-words">
              {regionalAtual?.nome} - {regionalAtual?.codigo}
            </p>
          </div>

          {/* Regional de Destino - SELECT NATIVO */}
          <div className="space-y-2">
            <Label htmlFor="regional_destino" className="text-sm sm:text-base">
              Regional de Destino *
            </Label>
            <select
              id="regional_destino"
              value={regionalDestinoId}
              onChange={(e) => setRegionalDestinoId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione a nova regional</option>
              {regionaisDisponiveis.length > 0 ? (
                regionaisDisponiveis.map(regional => (
                  <option key={regional.id} value={regional.id}>
                    {regional.nome} - {regional.codigo} ({regional.estado})
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma regional disponível</option>
              )}
            </select>
            <p className="text-xs text-muted-foreground">
              Selecione a regional para qual você deseja ser transferido
            </p>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm sm:text-base">
              Motivo da Solicitação *
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique o motivo da sua solicitação de transferência..."
              rows={4}
              required
              className="text-sm sm:text-base resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Seja claro sobre o motivo da transferência para facilitar a análise
            </p>
          </div>

          {/* Informação Importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              <strong>ℹ️ Importante:</strong> Sua solicitação será analisada pelo gestor de contrato ou sala técnica responsável. 
              Você será notificado quando houver uma resposta.
            </p>
          </div>

          {/* Botões */}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className=" w-full sm:w-auto order-1 sm:order-2"
              disabled={loading || regionaisDisponiveis.length === 0}
            >
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}