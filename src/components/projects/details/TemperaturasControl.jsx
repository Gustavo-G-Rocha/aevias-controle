/**
 * TemperaturasControl.jsx
 *
 * Card de temperaturas de controle do projeto CAUQ:
 * mistura, compactação e espalhamento (min/max em °C).
 */
import { DetailRange } from "@/components/projects/details/DetailPrimitives";

export default function TemperaturasControl({ temperaturas }) {
  if (!temperaturas || Object.keys(temperaturas).length === 0) return null;

  return (
    <div className="p-4 bg-[#F2F1EF] rounded-lg border border-[#00233B]/10 space-y-3">
      <h4 className="font-semibold text-[#00233B]">Temperaturas de Controle</h4>
      {temperaturas.mistura && (
        <DetailRange label="Mistura" min={temperaturas.mistura.min} max={temperaturas.mistura.max} unit="°C" />
      )}
      {temperaturas.compactacao && (
        <DetailRange label="Compactação" min={temperaturas.compactacao.min} max={temperaturas.compactacao.max} unit="°C" />
      )}
      {temperaturas.espalhamento && (
        <DetailRange label="Espalhamento" min={temperaturas.espalhamento.min} max={temperaturas.espalhamento.max} unit="°C" />
      )}
    </div>
  );
}