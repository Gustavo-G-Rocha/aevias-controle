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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, MapPin } from "lucide-react";
import { criarSolicitacaoTransferenciaRegional } from "@/services/solicitacoesService";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

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
      toast({ title: "Por favor, selecione a regional de destino e informe o motivo.", variant: "destructive" });
      return;
    }

    if (regionalDestinoId === regionalAtual.id) {
      toast({ title: "A regional de destino não pode ser a mesma da atual.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const regionalDestino = todasRegionais.find(r => r.id === regionalDestinoId);
      
      await criarSolicitacaoTransferenciaRegional({
        laboratorista_email: user.email,
        laboratorista_name: user.full_name,
        regional_atual_id: regionalAtual.id,
        regional_atual_nome: regionalAtual.nome,
        regional_destino_id: regionalDestinoId,
        regional_destino_nome: regionalDestino.nome,
        motivo: motivo.trim(),
        status: "pendente"
      });

      toast({ title: "Solicitação enviada com sucesso! Aguarde a aprovação do gestor ou sala técnica." });
      setRegionalDestinoId("");
      setMotivo("");
      onSuccess();
    } catch (error) {
      logger.error("Erro ao criar solicitação:", error);
      toast({ title: "Erro ao enviar solicitação. Tente novamente.", variant: "destructive" });
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
            <Select value={regionalDestinoId} onValueChange={setRegionalDestinoId}>
              <SelectTrigger className="h-10 bg-card"><SelectValue placeholder="Selecione a nova regional" /></SelectTrigger>
              <SelectContent title="Regional de Destino">
                {regionaisDisponiveis.length > 0 ? (
                  regionaisDisponiveis.map(regional => (
                    <SelectItem key={regional.id} value={regional.id}>
                      {regional.nome} - {regional.codigo} ({regional.estado})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled>Nenhuma regional disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
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