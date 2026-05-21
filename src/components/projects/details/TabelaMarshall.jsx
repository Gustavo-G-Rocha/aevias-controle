/**
 * TabelaMarshall.jsx
 * Parâmetros Marshall do projeto CAUQ.
 */
import { DetailItem, DetailRange } from "@/components/projects/details/DetailPrimitives";

export default function TabelaMarshall({ project }) {
  return (
    <div className="space-y-2">
      <DetailRange label="Teor de Ligante"
        min={project.teor_ligante?.min} max={project.teor_ligante?.max}
        otimo={project.teor_ligante?.otimo} unit="%" />
      <DetailItem label="Massa Específica Aparente"
        value={project.massa_especifica_aparente ? Number(project.massa_especifica_aparente).toFixed(3) : null}
        unit="g/cm³" />
      <DetailItem label="Densidade Máxima Medida (RICE)"
        value={project.densidade_maxima_medida ? Number(project.densidade_maxima_medida).toFixed(3) : null}
        unit="g/cm³" />
      <DetailRange label="Volume de Vazios"
        min={project.volume_vazios?.min} max={project.volume_vazios?.max}
        otimo={project.volume_vazios?.otimo} unit="%" />
      <DetailItem label="RTCD (mín)" value={project.rtcd?.min} unit=" MPa" />
      <DetailRange label="Estabilidade"
        min={project.estabilidade?.min} max={null}
        otimo={project.estabilidade?.projeto} unit=" N" />
      <DetailRange label="Fluência"
        min={project.fluencia?.min} max={project.fluencia?.max}
        otimo={project.fluencia?.projeto} unit=" mm" />
      <DetailItem label="VAM (mín)" value={project.vam?.min} unit="%" />
      <DetailRange label="RBV"
        min={project.rbv?.min} max={project.rbv?.max}
        otimo={project.rbv?.projeto} unit="%" />
      <DetailItem label="Equivalente de Areia (mín)" value={project.equivalente_areia_minimo} unit="%" />
    </div>
  );
}