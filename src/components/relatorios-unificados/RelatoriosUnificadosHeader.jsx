import React from "react";

export default function RelatoriosUnificadosHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Relatórios Unificados</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Selecione os filtros para gerar um relatório consolidado de registros.
      </p>
    </div>
  );
}