import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PreparacaoSuperficieSection({ data, onChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;
  const set = (field, value) => onChange({ ...data, [field]: value });

  const BoolRow = ({ field, label, children }) => (
    <tr>
      <td className="border border-border px-4 py-3 text-foreground">{children || label}</td>
      <td className="border border-border px-4 py-3 text-center">
        <input type="checkbox" checked={data[field] === true}
          onChange={(e) => set(field, e.target.checked ? true : false)}
          disabled={disabled} className="w-5 h-5 cursor-pointer" />
      </td>
      <td className="border border-border px-4 py-3 text-center">
        <input type="checkbox" checked={data[field] === false}
          onChange={(e) => set(field, e.target.checked ? false : true)}
          disabled={disabled} className="w-5 h-5 cursor-pointer" />
      </td>
    </tr>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Acompanhamento da Condição e Preparação da Superfície</h3>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border text-base">
        <thead className="bg-muted">
          <tr>
            <th className="border border-border px-4 py-3 text-left text-foreground font-medium">Serviço</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-20">Sim</th>
            <th className="border border-border px-4 py-3 text-center text-foreground font-medium w-20">Não</th>
            <th className="border border-border px-4 py-3 text-left text-foreground font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-border px-4 py-3 text-foreground">Superfície úmida?</td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.superficie_umida === true}
                onChange={(e) => set('superficie_umida', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.superficie_umida === false}
                onChange={(e) => set('superficie_umida', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-border px-4 py-3" rowSpan="5">
              <Textarea value={data.observacoes} onChange={(e) => set('observacoes', e.target.value)}
                disabled={disabled} rows={8} maxLength={500}
                className="bg-card border-border text-foreground w-full text-base" />
            </td>
          </tr>
          <tr>
            <td className="border border-border px-4 py-3 text-foreground">Temperatura do pavimento:</td>
            <td className="border border-border px-4 py-3 text-center bg-muted/30" colSpan="2">
              <div className="flex items-center justify-center gap-1">
                <Input type="number" value={data.temperatura_pavimento || ''}
                  onChange={(e) => set('temperatura_pavimento', e.target.value ? parseFloat(e.target.value) : null)}
                  disabled={disabled} placeholder="°C"
                  className="bg-card border-border text-foreground w-20 text-center h-10 text-base" />
                <span className="text-foreground text-base">°C</span>
              </div>
            </td>
          </tr>
          <BoolRow field="pavimento_patologias" label="Pavimento apresenta patologias?" />
          <BoolRow field="superficie_fresada" label="Superfície fresada? (Se sim acima)" />
          <tr>
            <td className="border border-border px-4 py-3 text-foreground">
              <div>A superfície foi limpa antes da aplicação?</div>
              <div className="text-sm text-muted-foreground italic mt-0.5">
                *Preferencialmente por vassouras mecânicas, podendo ser usados, também, processos manuais.
              </div>
            </td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.superficie_limpa === true}
                onChange={(e) => set('superficie_limpa', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-border px-4 py-3 text-center">
              <input type="checkbox" checked={data.superficie_limpa === false}
                onChange={(e) => set('superficie_limpa', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}