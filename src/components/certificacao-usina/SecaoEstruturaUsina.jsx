import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConformeField from "./ConformeField";

const RadioGroup = ({ options, value, onChange, disabled }) => (
  <div className="flex flex-wrap gap-3">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-1 cursor-pointer text-sm">
        <input
          type="radio"
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          disabled={disabled}
          className="accent-[#00233B]"
        />
        {opt}
      </label>
    ))}
  </div>
);

const FieldRow = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <Label className="text-xs text-slate-600">{label}</Label>
    {children}
  </div>
);

export default function SecaoEstruturaUsina({ formData, onNestedChange, handleChange, disabled }) {
  const ef = formData.estrutura_fisica || {};
  const ua = formData.usina_asfalto || {};

  const nested = (path, val) => onNestedChange(path, val);

  return (
    <div className="space-y-4">
      {/* 7.3 */}
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        7.3 ESTRUTURA E ESPAÇO FÍSICO
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <FieldRow label="Baias separadoras de agregado">
          <ConformeField value={ef.baias_separadoras} onChange={(v) => nested("estrutura_fisica.baias_separadoras", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Identificação das pilhas de agregado">
          <ConformeField value={ef.identificacao_pilhas} onChange={(v) => nested("estrutura_fisica.identificacao_pilhas", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Piso">
          <RadioGroup options={["Em concreto, inclinado", "Em revestimento primário", "Sem piso", "Outro"]} value={ef.piso_tipo} onChange={(v) => nested("estrutura_fisica.piso_tipo", v)} disabled={disabled} />
          {ef.piso_tipo === "Outro" && (
            <Input value={ef.piso_outro || ""} onChange={(e) => nested("estrutura_fisica.piso_outro", e.target.value)} disabled={disabled} placeholder="Especificar..." className="h-7 text-sm mt-1" />
          )}
        </FieldRow>
        <FieldRow label="Quantidade de silos">
          <RadioGroup options={["4 ou mais", "3 ou mais", "Menos de 3"]} value={ef.quantidade_silos} onChange={(v) => nested("estrutura_fisica.quantidade_silos", v)} disabled={disabled} />
        </FieldRow>
        {ef.quantidade_silos && (() => {
          const qtd = ef.quantidade_silos === "4 ou mais" ? 4 : ef.quantidade_silos === "3 ou mais" ? 3 : 2;
          const coberturas = Array.isArray(ef.coberturas_po_pedra) ? ef.coberturas_po_pedra : Array(qtd).fill(null);
          return Array.from({ length: qtd }, (_, i) => (
            <FieldRow key={i} label={`Cobertura do pó de pedra – Silo ${i + 1}`}>
              <RadioGroup
                options={["Fixa", "Móvel (lona)", "S/ cobertura"]}
                value={coberturas[i] ?? null}
                onChange={(v) => {
                  const next = [...(Array.isArray(ef.coberturas_po_pedra) ? ef.coberturas_po_pedra : Array(qtd).fill(null))];
                  next[i] = v;
                  nested("estrutura_fisica.coberturas_po_pedra", next);
                }}
                disabled={disabled}
              />
            </FieldRow>
          ));
        })()}
        <FieldRow label="Tamanho em relação a concha da pá carregadeira">
          <RadioGroup options={["No mínimo 1,25X", "No mínimo 1,1X", "Menos de 1,1X"]} value={ef.tamanho_relacao_concha} onChange={(v) => nested("estrutura_fisica.tamanho_relacao_concha", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Altura da divisória das baias (m)">
          <RadioGroup options={["No mínimo 0,75", "No mínimo 0,50", "No mínimo 0,25", "Sem separador"]} value={ef.altura_divisoria_baias} onChange={(v) => nested("estrutura_fisica.altura_divisoria_baias", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Sistema de vibração">
          <ConformeField value={ef.sistema_vibracao} onChange={(v) => nested("estrutura_fisica.sistema_vibracao", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Controle de temperatura (tanques de estocagem)">
          <RadioGroup options={["Automático", "Manual", "Sem controle"]} value={ef.tanque_controle_temperatura} onChange={(v) => nested("estrutura_fisica.tanque_controle_temperatura", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Termômetros internos">
          <ConformeField value={ef.termometros_internos} onChange={(v) => nested("estrutura_fisica.termometros_internos", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Bomba de Engrenagem">
          <ConformeField value={ef.bomba_engrenagem} onChange={(v) => nested("estrutura_fisica.bomba_engrenagem", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Agitadores">
          <ConformeField value={ef.agitadores} onChange={(v) => nested("estrutura_fisica.agitadores", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Bacia de contenção">
          <ConformeField value={ef.bacia_contencao} onChange={(v) => nested("estrutura_fisica.bacia_contencao", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
      </div>

      {/* 7.4 */}
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        7.4 USINA DE ASFALTO
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <FieldRow label="Tipo">
          <Input value={ua.tipo || ""} onChange={(e) => nested("usina_asfalto.tipo", e.target.value)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Modelo">
          <Input value={ua.modelo || ""} onChange={(e) => nested("usina_asfalto.modelo", e.target.value)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Ano de fabricação">
          <Input value={ua.ano_fabricacao || ""} onChange={(e) => nested("usina_asfalto.ano_fabricacao", e.target.value)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Capacidade nominal de produção (t/h)">
          <Input type="number" value={ua.capacidade_nominal || ""} onChange={(e) => nested("usina_asfalto.capacidade_nominal", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Fontes elétricas">
          <RadioGroup options={["Rede elétrica convencional", "Geradores a diesel", "Energia solar fotovoltaica", "Sistemas híbridos"]} value={ua.fonte_eletrica} onChange={(v) => nested("usina_asfalto.fonte_eletrica", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Observações (fonte elétrica)">
          <Input value={ua.observacoes_fonte || ""} onChange={(e) => nested("usina_asfalto.observacoes_fonte", e.target.value)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Produção nominal (t/h)">
          <Input type="number" value={ua.producao_nominal || ""} onChange={(e) => nested("usina_asfalto.producao_nominal", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Umidade (%)">
          <Input type="number" value={ua.umidade_pct || ""} onChange={(e) => nested("usina_asfalto.umidade_pct", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Altitude (m)">
          <Input type="number" value={ua.altitude_m || ""} onChange={(e) => nested("usina_asfalto.altitude_m", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="(%) material retido/passante na malha nº 8">
          <Input type="number" value={ua.material_retido_n8 || ""} onChange={(e) => nested("usina_asfalto.material_retido_n8", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Temperatura final da massa (°C)">
          <Input type="number" value={ua.temperatura_final_massa || ""} onChange={(e) => nested("usina_asfalto.temperatura_final_massa", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Produção efetiva do equipamento F=AxBxCxDxE">
          <Input type="number" value={ua.producao_efetiva || ""} onChange={(e) => nested("usina_asfalto.producao_efetiva", e.target.value ? parseFloat(e.target.value) : null)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Sistema de secagem - Contra-fluxo">
          <ConformeField value={ua.secagem_contra_fluxo} onChange={(v) => nested("usina_asfalto.secagem_contra_fluxo", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Sistema de dosagem e mistura">
          <RadioGroup options={["Automático", "Manual"]} value={ua.dosagem_mistura} onChange={(v) => nested("usina_asfalto.dosagem_mistura", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Tipo de combustível (queimador)">
          <Input value={ua.tipo_combustivel || ""} onChange={(e) => nested("usina_asfalto.tipo_combustivel", e.target.value)} disabled={disabled} className="h-8 text-sm" />
        </FieldRow>
        <FieldRow label="Filtro de mangas - verificação executada?">
          <ConformeField value={ua.filtro_verificacao_executado} onChange={(v) => nested("usina_asfalto.filtro_verificacao_executado", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Filtro de mangas - está conforme?">
          <ConformeField value={ua.filtro_conforme} onChange={(v) => nested("usina_asfalto.filtro_conforme", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Dosador de finos retornados do filtro de mangas">
          <ConformeField value={ua.dosador_finos_retornados} onChange={(v) => nested("usina_asfalto.dosador_finos_retornados", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Dosador de fíller">
          <RadioGroup options={["Sim", "Não", "Nenhum"]} value={ua.dosador_filler} onChange={(v) => nested("usina_asfalto.dosador_filler", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Sistema mecânico de destorroamento e peneiramento de RAP">
          <ConformeField value={ua.sistema_destorroamento_rap} onChange={(v) => nested("usina_asfalto.sistema_destorroamento_rap", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Sistema de classificação de RAP em pelo menos duas frações">
          <ConformeField value={ua.classificacao_rap_fracoes} onChange={(v) => nested("usina_asfalto.classificacao_rap_fracoes", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
        <FieldRow label="Operação">
          <RadioGroup options={["Automático", "Manual", "Nenhum"]} value={ua.operacao} onChange={(v) => nested("usina_asfalto.operacao", v)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Projeto de misturas mornas (WMA)">
          <ConformeField value={ua.projeto_wma} onChange={(v) => nested("usina_asfalto.projeto_wma", v)} disabled={disabled} opcao1="Sim" opcao2="Não" />
        </FieldRow>
      </div>
    </div>
  );
}