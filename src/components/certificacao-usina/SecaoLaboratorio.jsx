import React from "react";
import EquipamentoRow from "./EquipamentoRow";
import SubSectionTitle from "./SubSectionTitle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EQUIPAMENTOS = [
  { key: "balanca_10kg", label: "Balança Digital 10 kg" },
  { key: "balanca_4_1kg", label: "Balança Digital 4,1 kg" },
  { key: "banho_maria", label: "Banho Maria com Temperatura regulável" },
  { key: "cesto_adesividade", label: "Cesto adesividade" },
  { key: "kit_pesagem_hidrostatica", label: "Kit Pesagem Hidrostática" },
  { key: "compactador_marshall", label: "Compactador Marshall" },
  { key: "conjunto_peneiras", label: "Conjunto de Peneiras" },
  { key: "conjunto_equiv_areia", label: "Conjunto Equivalente de Areia" },
  { key: "conjunto_rice", label: "Conjunto RICE" },
  { key: "estufa", label: "Estufa" },
  { key: "extensometro_fluometro", label: "Extensômetro/Fluômetro" },
  { key: "extrator_cp_marshall", label: "Extrator de CP's Marshall" },
  { key: "molde_estabilidade", label: "Molde para Estabilidade" },
  { key: "molde_resistencia", label: "Molde para Resistência" },
  { key: "prensa_marshall", label: "Prensa Marshall" },
  { key: "refluxo_soxhlet", label: "Refluxo/Soxhlet" },
  { key: "rotarex", label: "Rotarex" },
  { key: "soquete_marshall", label: "Soquete Marshall" },
  { key: "termometro_infravermelho", label: "Termômetro Infravermelho" },
  { key: "termometro_bimetalico", label: "Termômetro Bi-metálico" },
  { key: "anel_bola", label: "Anel e bola" },
  { key: "ductilometro", label: "Ductilômetro" },
  { key: "viscosimetro_brookfield", label: "Viscosímetro Brookfield" },
];

export default function SecaoLaboratorio({ formData, onNestedChange, disabled }) {
  const lab = formData.laboratorio || {};
  const equip = lab.equipamentos || {};
  const prof = lab.profissionais || {};

  const profRow = (key, label) => {
    const possuiKey = `${key}_possui`;
    const qtdeKey = `${key}_quantidade`;
    return (
      <tr key={key} className="border-b border-slate-200 hover:bg-slate-50/50">
        <td className="py-2 px-3 text-sm text-slate-700">{label}</td>
        <td className="py-2 px-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer text-sm">
              <input
                type="radio"
                checked={prof[possuiKey] === true}
                onChange={() => onNestedChange(`laboratorio.profissionais.${possuiKey}`, true)}
                disabled={disabled}
                className="accent-green-600"
              />
              <span className="text-green-700 font-medium">Possui</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-sm">
              <input
                type="radio"
                checked={prof[possuiKey] === false || prof[possuiKey] == null}
                onChange={() => onNestedChange(`laboratorio.profissionais.${possuiKey}`, false)}
                disabled={disabled}
                className="accent-red-600"
              />
              <span className="text-red-700 font-medium">Não possui</span>
            </label>
            {prof[possuiKey] === true && (
              <div className="flex items-center gap-1">
                <Label className="text-xs text-slate-500">Qtde:</Label>
                <Input
                  type="number"
                  min="0"
                  value={prof[qtdeKey] || ""}
                  onChange={(e) => onNestedChange(`laboratorio.profissionais.${qtdeKey}`, e.target.value ? parseInt(e.target.value) : null)}
                  disabled={disabled}
                  className="h-7 w-16 text-sm"
                />
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        7.1 LABORATÓRIO
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 rounded">
          <tbody>
            <SubSectionTitle>Equipamentos Mínimos</SubSectionTitle>
            {EQUIPAMENTOS.map((eq) => (
              <EquipamentoRow
                key={eq.key}
                label={eq.label}
                path={`laboratorio.equipamentos.${eq.key}`}
                value={equip[eq.key]}
                onChange={onNestedChange}
                disabled={disabled}
              />
            ))}
            <SubSectionTitle>Profissional</SubSectionTitle>
            {profRow("laboratorista", "Laboratorista")}
            {profRow("auxiliar_laboratorio", "Auxiliar de Laboratório")}
            {profRow("encarregado_laboratorio", "Encarregado de Laboratório")}
          </tbody>
        </table>
      </div>
    </div>
  );
}