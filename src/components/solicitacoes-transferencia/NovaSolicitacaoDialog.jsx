import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { getRegionaisDisponiveis, validateNovasolicitacao } from "@/utils/solicitacoesTransferenciaUtils";
import { toast } from "@/components/ui/use-toast";

export const NovaSolicitacaoDialog = React.memo(({ isOpen, onClose, onSubmit, regionais, regionalAtual }) => {
  const [formData, setFormData] = useState({
    regional_destino_id: '',
    motivo: ''
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const validation = validateNovasolicitacao(formData);
    if (!validation.valid) {
      toast({ title: validation.message });
      return;
    }

    const success = onSubmit(formData);
    if (success) {
      setFormData({ regional_destino_id: '', motivo: '' });
      onClose(false);
    }
  }, [formData, onSubmit, onClose]);

  const regionaisDisponiveis = useMemo(() => 
    getRegionaisDisponiveis(regionais, regionalAtual),
    [regionais, regionalAtual]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/80 backdrop-blur-lg border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Transferência</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {regionalAtual && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-secondary">
                <strong>Regional Atual:</strong> {regionalAtual.nome}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="regional_destino">Regional de Destino *</Label>
            <select
              id="regional_destino"
              value={formData.regional_destino_id}
              onChange={(e) => setFormData(prev => ({ ...prev, regional_destino_id: e.target.value }))}
              required
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">Selecione a regional de destino</option>
              {regionaisDisponiveis.map(regional => (
                <option key={regional.id} value={regional.id}>
                  {regional.nome} {regional.estado && `(${regional.estado})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="motivo">Motivo da Solicitação *</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Explique o motivo da sua solicitação de transferência..."
              rows={4}
              required
              maxLength="500"
            />
            <p className="text-xs text-right text-muted-foreground mt-1">
              {formData.motivo.length} / 500
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button type="submit" className="">
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

NovaSolicitacaoDialog.displayName = 'NovaSolicitacaoDialog';