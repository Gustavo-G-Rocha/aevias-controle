/**
 * LiganteInfo.jsx
 *
 * Card com informações do ligante asfáltico (tipo, fornecedor, densidade).
 * Usado na seção de Ligante do ProjectDetails para projetos CAUQ.
 */
import { DetailItem } from "@/components/projects/details/DetailPrimitives";

export default function LiganteInfo({ ligante }) {
  if (!ligante || Object.keys(ligante).length === 0) return null;

  const formatDensidade = (v) => (v === null || v === undefined) ? null : Number(v).toFixed(3);

  return (
    <div className="p-4 bg-card rounded-lg border border-border/10">
      <h4 className="font-semibold text-foreground mb-3">Ligante Asfáltico</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailItem label="Tipo" value={ligante.tipo} />
        <DetailItem label="Fornecedor" value={ligante.fornecedor} />
        <DetailItem label="Densidade" value={formatDensidade(ligante.densidade)} unit="g/cm³" />
      </div>
    </div>
  );
}