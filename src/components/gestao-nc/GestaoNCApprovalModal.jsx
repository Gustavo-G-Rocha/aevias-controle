import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function GestaoNCApprovalModal({
  open,
  onOpenChange,
  approvalAction,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  onCancel,
}) {
  const isApprove = approvalAction === "approve";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg border-white/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isApprove ? "Aprovar NC" : "Reprovar NC"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Ao aprovar, o gestor poderá alterar o status da NC."
              : "Ao reprovar, a NC retornará para status \"Aberta\" e o gestor será notificado do motivo."}
          </DialogDescription>
        </DialogHeader>

        {!isApprove && (
          <div className="space-y-2">
            <label htmlFor="rejection_reason" className="text-sm font-medium text-foreground">
              Motivo da reprovação *
            </label>
            <Textarea
              id="rejection_reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Descreva o motivo da reprovação..."
              className="min-h-[100px] bg-card/50 border-white/30 text-foreground"
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-white/30 text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={isApprove ? onApprove : onReject}
            className={
              isApprove
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            }
          >
            {isApprove ? "Confirmar Aprovação" : "Confirmar Reprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}