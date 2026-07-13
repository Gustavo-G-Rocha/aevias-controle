import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Clock } from "lucide-react";

/**
 * Modal de aviso prévio antes do logout automático por inatividade.
 * Mostra countdown regressivo e oferece "Continuar logado" ou "Sair agora".
 */
export default function SessionTimeoutWarning({
  open,
  countdown,
  onExtend,
  onLogoutNow,
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: "var(--color-warning)" }}
            />
            <AlertDialogTitle className="text-lg">
              Sessão expirando
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            Você será desconectado automaticamente em{" "}
            <span
              className="font-bold text-base"
              style={{ color: "var(--color-warning)" }}
            >
              {countdown}s
            </span>{" "}
            por inatividade.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <AlertDialogCancel
            onClick={onLogoutNow}
            className="mt-0 flex-1"
          >
            Sair agora
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onExtend}
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-1" />
            Continuar logado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}