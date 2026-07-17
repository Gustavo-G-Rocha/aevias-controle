import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <Select
              value={formData.regional_destino_id || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, regional_destino_id: value }))}
            >
              <SelectTrigger id="regional_destino">
                <SelectValue placeholder="Selecione a regional de destino" />
              </SelectTrigger>
              <SelectContent title="Regional de Destino">
                {regionaisDisponiveis.map(regional => (
                  <SelectItem key={regional.id} value={regional.id}>
                    {regional.nome} {regional.estado && `(${regional.estado})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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