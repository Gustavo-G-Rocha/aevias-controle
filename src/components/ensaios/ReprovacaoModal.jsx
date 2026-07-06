import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export const ReprovacaoModal = React.memo(({ ensaio, isOpen, onClose, onReprove }) => {
  const [motivo, setMotivo] = useState('');

  const handleReprove = useCallback(async () => {
    if (!motivo.trim()) {
      toast({ title: 'Por favor, informe o motivo da reprovação.', variant: "destructive" });
      return;
    }

    await onReprove(ensaio, motivo);
    setMotivo('');
  }, [ensaio, motivo, onReprove]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/80 backdrop-blur-lg border-white/20 text-foreground">
        <DialogHeader>
          <DialogTitle>Reprovar Registro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo da Reprovação *</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da reprovação..."
              rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleReprove}>
            Reprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ReprovacaoModal.displayName = 'ReprovacaoModal';