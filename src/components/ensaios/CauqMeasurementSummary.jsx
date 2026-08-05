import React from "react";

const format = (value, suffix = "") => value == null || value === "" ? "—" : `${value}${suffix}`;

export default function CauqMeasurementSummary({ ensaio }) {
  if (ensaio.entityType !== "EnsaioCAUQ") return null;

  const extracao = ensaio.extracao_ligante || {};
  const sieveCount = Object.values(ensaio.granulometria?.peso_retido_peneiras || {})
    .filter(value => value != null && value !== "").length;

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-xs" data-testid="cauq-measurement-summary">
      <p className="mb-2 font-semibold text-foreground">Medições principais</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground sm:grid-cols-3">
        <span>Local: {format(ensaio.local_coleta)}</span>
        <span>Temperatura CAP: {format(ensaio.temperatura_cap, " °C")}</span>
        <span>Com ligante: {format(extracao.amostra_com_ligante, " g")}</span>
        <span>Sem ligante: {format(extracao.amostra_sem_ligante, " g")}</span>
        <span>Peso do ligante: {format(extracao.peso_ligante, " g")}</span>
        <span>Teor de ligante: {format(extracao.teor_ligante_real, "%")}</span>
        <span>Peneiras preenchidas: {sieveCount}</span>
      </div>
    </div>
  );
}