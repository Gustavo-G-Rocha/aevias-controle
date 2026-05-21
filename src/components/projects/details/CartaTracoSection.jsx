/**
 * CartaTracoSection.jsx
 * Seção de detalhes para projetos CARTA_TRACO_CONCRETO.
 */
import { DetailItem, DetailRange } from "@/components/projects/details/DetailPrimitives";

export default function CartaTracoSection({ project }) {
  return (
    <div className="space-y-2">
      <DetailItem label="Concreteira" value={project.concreteira} />
      <DetailItem label="Tipo de Cimento" value={project.tipo_cimento} />
      <DetailItem label="Tipo de Aditivo" value={project.tipo_aditivo} />
      <DetailItem label="FCK" value={project.fck} unit=" MPa" />
      <DetailItem label="Consumo de Água" value={project.consumo_agua} unit=" L/m³" />
      <DetailItem label="Slump de Projeto" value={project.slump_projeto} unit=" cm" />
      <DetailRange label="Slump (mín/máx)"
        min={project.slump_minimo} max={project.slump_maximo} unit=" cm" />
    </div>
  );
}