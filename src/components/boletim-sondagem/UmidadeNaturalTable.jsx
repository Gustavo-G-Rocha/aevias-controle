import React from "react";
import { Input } from "@/components/ui/input";
import FormNumberInput from "./FormNumberInput";
import { calcularUmidadeMedia } from "@/utils/boletimSondagemUtils";

/**
 * Tabela de ensaio de Umidade Natural (DNER-ME 213/94).
 * Usada tanto para a 1ª quanto para a 2ª umidade,
 * com handlers distintos passados via props.
 */
export default function UmidadeNaturalTable({ umidade, isEditable, onChange, onFieldChange }) {
  // onChange(field, value) — para campos com recálculo automático (umidade_natural_1)
  // onFieldChange(field, value) — para campos simples (umidade_natural_2)
  const handleChange = onChange ?? onFieldChange;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#00233B]/10">
            <th className="border border-[#00233B]/20 px-3 py-2 text-left font-medium text-[#00233B]">Campo</th>
            <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 1</th>
            <th className="border border-[#00233B]/20 px-3 py-2 text-center font-medium text-[#00233B]">Amostra 2</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white/30">
            <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">Camada ensaiada</td>
            <td className="border border-[#00233B]/20 px-2 py-1" colSpan={2}>
              <Input value={umidade.camada_ensaiada_1 || ''} onChange={e => handleChange('camada_ensaiada_1', e.target.value)} disabled={!isEditable} className="h-8 text-sm" placeholder="Ex.: 0,00 - 0,60m" />
            </td>
          </tr>
          {[
            { label: "Nº cápsula", fields: ['no_capsula_1', 'no_capsula_2'], type: 'text' },
            { label: "Massa cápsula (g)", fields: ['massa_capsula_1', 'massa_capsula_2'], type: 'number' },
            { label: "Massa cap + solo úmido (g)", fields: ['massa_cap_solo_umido_1', 'massa_cap_solo_umido_2'], type: 'number' },
            { label: "Massa cap + solo seco (g)", fields: ['massa_cap_solo_seco_1', 'massa_cap_solo_seco_2'], type: 'number' },
          ].map(({ label, fields, type }, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white/10' : 'bg-white/30'}>
              <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80">{label}</td>
              {fields.map((f, fi) => (
                <td key={fi} className="border border-[#00233B]/20 px-2 py-1">
                  {type === 'text'
                    ? <Input value={umidade[f] || ''} onChange={e => handleChange(f, e.target.value)} disabled={!isEditable} className="h-8 text-sm" />
                    : <FormNumberInput value={umidade[f]} onChange={v => handleChange(f, v)} disabled={!isEditable} className="h-8 text-sm" />
                  }
                </td>
              ))}
            </tr>
          ))}
          {[
            { label: "Massa da água (g)", keys: ['massa_agua_1', 'massa_agua_2'] },
            { label: "Massa do solo seco (g)", keys: ['massa_solo_seco_1', 'massa_solo_seco_2'] },
          ].map(({ label, keys }, ri) => (
            <tr key={`calc-${ri}`} className="bg-[#BFCF99]/10">
              <td className="border border-[#00233B]/20 px-3 py-1.5 font-medium text-[#00233B]/80 italic">{label}</td>
              {keys.map((k, ki) => (
                <td key={ki} className="border border-[#00233B]/20 px-3 py-1.5 text-center font-semibold text-[#00233B]">
                  {umidade[k] !== null && umidade[k] !== undefined ? umidade[k].toFixed(2) : '—'}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-[#BFCF99]/30">
            <td className="border border-[#00233B]/20 px-3 py-2 font-bold text-[#00233B]">Umidade (%)</td>
            <td className="border border-[#00233B]/20 px-3 py-2 text-center font-bold text-[#00233B] text-base" colSpan={2}>
              {(() => {
                const media = calcularUmidadeMedia(umidade.umidade_1, umidade.umidade_2);
                return media !== null ? `${media} %` : '—';
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}