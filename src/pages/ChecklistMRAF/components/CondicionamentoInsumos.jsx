import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SimNaoRow = ({ label, value, onChange, disabled, colSpan }) => (
  <tr>
    <td className="border border-slate-300 px-4 py-3 text-slate-700">{label}</td>
    <td className="border border-slate-300 px-4 py-3 text-center">
      <input type="checkbox" checked={value === true}
        onChange={(e) => onChange(e.target.checked ? true : false)}
        disabled={disabled} className="w-5 h-5 cursor-pointer" />
    </td>
    <td className="border border-slate-300 px-4 py-3 text-center" colSpan={colSpan}>
      <input type="checkbox" checked={value === false}
        onChange={(e) => onChange(e.target.checked ? false : true)}
        disabled={disabled} className="w-5 h-5 cursor-pointer" />
    </td>
  </tr>
);

export default function CondicionamentoInsumos({ data, onChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;
  const set = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Condicionamento dos Insumos</h3>
      <table className="w-full border-collapse border border-slate-300 text-base">
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-300 px-4 py-3 text-left text-slate-700 font-medium">Serviço</th>
            <th className="border border-slate-300 px-4 py-3 text-center text-slate-700 font-medium w-20">Sim</th>
            <th className="border border-slate-300 px-4 py-3 text-center text-slate-700 font-medium w-20">Não</th>
            <th className="border border-slate-300 px-4 py-3 text-left text-slate-700 font-medium">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-4 py-3 text-slate-700">Agregados separados no canteiro?</td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agregados_separados === true}
                onChange={(e) => set('agregados_separados', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agregados_separados === false}
                onChange={(e) => set('agregados_separados', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-slate-300 px-4 py-3" rowSpan="5">
              <Textarea value={data.observacoes} onChange={(e) => set('observacoes', e.target.value)}
                disabled={disabled} rows={8} maxLength={500}
                className="bg-white border-slate-200 text-slate-700 w-full text-base" />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-3 text-slate-700">Agregados devidamente cobertos?</td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agregados_cobertos === true}
                onChange={(e) => set('agregados_cobertos', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agregados_cobertos === false}
                onChange={(e) => set('agregados_cobertos', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-3 text-slate-700">Filler utilizado:</td>
            <td className="border border-slate-300 px-4 py-3 text-center" colSpan="2">
              <Input value={data.filler_utilizado} onChange={(e) => set('filler_utilizado', e.target.value)}
                disabled={disabled} placeholder="Especificar"
                className="bg-white border-slate-200 text-slate-700 w-full h-10 text-base" />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-3 text-slate-700">Utilização de aditivos?</td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.utilizacao_aditivos === true}
                onChange={(e) => set('utilizacao_aditivos', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.utilizacao_aditivos === false}
                onChange={(e) => set('utilizacao_aditivos', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-3 text-slate-700">Água contaminada?</td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agua_contaminada === true}
                onChange={(e) => set('agua_contaminada', e.target.checked ? true : false)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
            <td className="border border-slate-300 px-4 py-3 text-center">
              <input type="checkbox" checked={data.agua_contaminada === false}
                onChange={(e) => set('agua_contaminada', e.target.checked ? false : true)}
                disabled={disabled} className="w-5 h-5 cursor-pointer" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}