import React from "react";
import ChecklistRow from "./ChecklistRow";
import SectionTitle from "./SectionTitle";

export default function SecaoAspectosLegais({ formData, onNestedChange, disabled }) {
  const al = formData.aspectos_legais || {};
  const row = (label, key, opcao1 = "Sim", opcao2 = "Não") => (
    <ChecklistRow
      key={key}
      label={label}
      path={`aspectos_legais.${key}`}
      value={al[key]}
      onChange={onNestedChange}
      disabled={disabled}
      opcao1={opcao1}
      opcao2={opcao2}
    />
  );

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        4 - ASPECTOS LEGAIS DO EMPREENDIMENTO
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 rounded">
          <tbody>
            <SectionTitle>No caso de execução de obras em caráter temporário</SectionTitle>
            {row("Autorização Ambiental (AA)", "autorizacao_ambiental")}
            <SectionTitle>No caso da produção de concreto asfáltico para fins de comercialização</SectionTitle>
            {row("Licença Prévia (LP)", "licenca_previa")}
            {row("Licença de Instalação (LI)", "licenca_instalacao")}
            {row("Licença de Operação (LO)", "licenca_operacao")}
            <SectionTitle>Instalação da Usina</SectionTitle>
            {row("Usina está instalada dentro de uma pedreira?", "usina_em_pedreira")}
            {row("Existe licenciamento da pedreira?", "licenciamento_pedreira")}
          </tbody>
        </table>
      </div>
    </div>
  );
}