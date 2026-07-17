import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const isOutOfRange = (realizado, resultado, min, max) =>
  realizado && resultado !== null && (resultado < min || resultado > max);

export default function AcompanhamentoAplicacaoSection({ data, onChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;
  const setKey = (key, field, value) => onChange({ ...data, [key]: { ...data[key], [field]: value } });
  const setObs = (value) => onChange({ ...data, observacoes: value });

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Acompanhamento da Aplicação</h3>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border text-base">
        <thead className="bg-muted">
          <tr>
            <th className="border border-border px-4 py-3 text-left text-foreground font-medium">Serviço</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-20">Sim</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-20">Não</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-28">Resultado</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-36">Limites DNIT 035/2018</th>
            <th className="border border-border px-4 py-3 text-left text-foreground font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          {/* Tempo rompimento/cura */}
          <tr>
            <td className="border border-border px-4 py-3 text-foreground">Aguardado tempo necessário para rompimento/cura?</td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.tempo_rompimento_cura.realizado === true}
                onChange={(e) => setKey('tempo_rompimento_cura', 'realizado', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.tempo_rompimento_cura.realizado === false}
                onChange={(e) => setKey('tempo_rompimento_cura', 'realizado', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-border px-4 py-3 text-center bg-muted/30">
              <span className="text-muted-foreground text-base">N/A</span>
            </td>
            <td className="border border-border px-4 py-3 text-center bg-muted/30">
              <span className="text-muted-foreground text-base">N/A</span>
            </td>
            <td className="border border-border px-4 py-3" rowSpan="4">
              <Textarea value={data.observacoes} onChange={(e) => setObs(e.target.value)}
                disabled={disabled} rows={8} maxLength={500}
                className="bg-card border-border text-foreground w-full text-base" />
            </td>
          </tr>

          {/* Taxa Aplicação */}
          {[
            { key: 'taxa_aplicacao', label: 'Taxa de Aplicação', step: '0.01', placeholder: 'kg/m²', min: 8, max: 16, limites: '8 kg/m² a 16 kg/m²' },
            { key: 'residuo_emulsao', label: 'Resíduo da Emulsão', step: '0.1', placeholder: '%', min: 6.5, max: 12.0, limites: '6,5% a 12,0%' },
            { key: 'espessura_camada', label: 'Espessura da Camada', step: '0.1', placeholder: 'mm', min: 6, max: 20, limites: '6 mm a 20 mm' },
          ].map(({ key, label, step, placeholder, min, max, limites }) => {
            const item = data[key];
            const outOfRange = isOutOfRange(item.realizado, item.resultado, min, max);
            return (
              <tr key={key}>
                <td className="border border-border px-4 py-3 text-foreground">{label}</td>
                <td className="border border-border px-4 py-3 text-center">
                  <input type="checkbox" checked={item.realizado === true}
                    onChange={(e) => setKey(key, 'realizado', e.target.checked ? true : false)}
                    disabled={disabled} className="w-5 h-5 cursor-pointer" />
                </td>
                <td className="border border-border px-4 py-3 text-center">
                  <input type="checkbox" checked={item.realizado === false}
                    onChange={(e) => setKey(key, 'realizado', e.target.checked ? false : true)}
                    disabled={disabled} className="w-5 h-5 cursor-pointer" />
                </td>
                <td className="border border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input type="number" step={step} value={item.resultado || ''}
                      onChange={(e) => setKey(key, 'resultado', e.target.value ? parseFloat(e.target.value) : null)}
                      disabled={disabled || item.realizado === false}
                      placeholder={placeholder}
                      className={`bg-card border-border h-10 text-base ${outOfRange ? 'text-destructive font-bold' : 'text-foreground'}`} />
                    {outOfRange && <span className="text-destructive text-xl" title="Fora dos parâmetros">⚠️</span>}
                  </div>
                </td>
                <td className="border border-border px-4 py-3 text-center">
                  <span className="text-muted-foreground text-base">{limites}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}