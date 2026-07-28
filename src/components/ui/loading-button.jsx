import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Botão para ações/mutations (salvar, aprovar, assinar, exportar).
 * Enquanto `loading` está ativo o botão fica desabilitado — evita
 * duplo clique em operações sensíveis (hash-chain de assinatura).
 *
 * Props: loading, loadingText, icon (elemento), + props de Button.
 */
export default function LoadingButton({
  loading = false,
  loadingText,
  icon = null,
  disabled = false,
  children,
  ...props
}) {
  return (
    <Button {...props} disabled={disabled || loading} aria-busy={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : icon}
      {loading ? (loadingText || children) : children}
    </Button>
  );
}