import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConformeField from "./ConformeField";
import { PENEIRAS_GRANULOMETRIA } from "@/utils/certificacaoUsinaUtils";

function EnsaioTable({ title, rows, onRowChange, disabled, showPeneira = false }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">{title}</h4>
      <table className="w-full border border-slate-300 text-xs">
        <thead>
          <tr className="bg-slate-100">
            {showPeneira && <th className="border border-slate-300 px-2 py-1">Peneira</th>}
            <th className="border border-slate-300 px-2 py-1">Projeto</th>
            <th className="border border-slate-300 px-2 py-1">Obtido</th>
            <th className="border border-slate-300 px-2 py-1">Erro</th>
            {!showPeneira && <th className="border border-slate-300 px-2 py-1">Desv. Pad.</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {showPeneira && (
                <td className="border border-slate-300 px-2 py-1 font-medium">{row.peneira}</td>
              )}
              {["projeto", "obtido", "erro"].map((col) => (
                <td key={col} className="border border-slate-300 p-0.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={row[col] != null ? String(row[col]) : ""}
                    onBlur={(e) => {
                      const v = e.target.value.replace(',', '.');
                      const n = v !== '' ? parseFloat(v) : null;
                      onRowChange(i, col, isNaN(n) ? null : n);
                    }}
                    disabled={disabled}
                    className="w-full h-7 px-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                  />
                </td>
              ))}
              {!showPeneira && (
                <td className="border border-slate-300 p-0.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={row.desvio_padrao != null ? String(row.desvio_padrao) : ""}
                    onBlur={(e) => {
                      const v = e.target.value.replace(',', '.');
                      const n = v !== '' ? parseFloat(v) : null;
                      onRowChange(i, "desvio_padrao", isNaN(n) ? null : n);
                    }}
                    disabled={disabled}
                    className="w-full h-7 px-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SecaoAfeicao({ formData, onNestedChange, onEnsaioValidacaoChange, onGranulometriaChange, disabled }) {
  const afeicao = formData.afeicao || {};
  const ev = formData.ensaios_validacao || {};

  // Sempre usa as peneiras canônicas como base; mescla valores salvos pelo índice
  const granRows = PENEIRAS_GRANULOMETRIA.map((p, i) => {
    const saved = ev.granulometria?.[i] || {};
    return { peneira: p, projeto: saved.projeto ?? null, obtido: saved.obtido ?? null, erro: saved.erro ?? null };
  });

  const ensaioRows = (key, count = 4) => {
    const saved = Array.isArray(ev[key]) ? ev[key] : [];
    return Array.from({ length: Math.max(count, saved.length) }, (_, i) =>
      saved[i] || { projeto: null, obtido: null, erro: null, desvio_padrao: null }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        7.2 AFERIÇÃO, REPETIBILIDADE E REPRODUTIBILIDADE
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <div className="space-y-2 p-3 border border-slate-200 rounded">
          <h4 className="text-sm font-semibold text-slate-700">Repetibilidade</h4>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 w-36">Desvio padrão obtido:</Label>
            <Input
              type="number"
              step="0.0001"
              value={afeicao.repetibilidade_desvio_padrao || ""}
              onChange={(e) => onNestedChange("afeicao.repetibilidade_desvio_padrao", e.target.value ? parseFloat(e.target.value) : null)}
              disabled={disabled}
              className="h-7 text-sm w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 w-36">Satisfatório?</Label>
            <ConformeField
              value={afeicao.repetibilidade_satisfatorio}
              onChange={(v) => onNestedChange("afeicao.repetibilidade_satisfatorio", v)}
              disabled={disabled}
              opcao1="Sim"
              opcao2="Não"
            />
          </div>
        </div>
        <div className="space-y-2 p-3 border border-slate-200 rounded">
          <h4 className="text-sm font-semibold text-slate-700">Reprodutibilidade</h4>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 w-36">Desvio padrão obtido:</Label>
            <Input
              type="number"
              step="0.0001"
              value={afeicao.reprodutibilidade_desvio_padrao || ""}
              onChange={(e) => onNestedChange("afeicao.reprodutibilidade_desvio_padrao", e.target.value ? parseFloat(e.target.value) : null)}
              disabled={disabled}
              className="h-7 text-sm w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-500 w-36">Satisfatório?</Label>
            <ConformeField
              value={afeicao.reprodutibilidade_satisfatorio}
              onChange={(v) => onNestedChange("afeicao.reprodutibilidade_satisfatorio", v)}
              disabled={disabled}
              opcao1="Sim"
              opcao2="Não"
            />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-700 px-1">Ensaios para Validação de Profissionais</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
        <EnsaioTable
          title="Granulometria"
          rows={granRows}
          onRowChange={(i, col, val) => onGranulometriaChange(i, col, val)}
          disabled={disabled}
          showPeneira
        />
        <EnsaioTable
          title="Teor de Ligante (Rotarex)"
          rows={ensaioRows("teor_ligante_rotarex")}
          onRowChange={(i, col, val) => onEnsaioValidacaoChange("teor_ligante_rotarex", i, col, val)}
          disabled={disabled}
        />
        <EnsaioTable
          title="Volume de Vazios"
          rows={ensaioRows("volume_vazios")}
          onRowChange={(i, col, val) => onEnsaioValidacaoChange("volume_vazios", i, col, val)}
          disabled={disabled}
        />
        <EnsaioTable
          title="Densidade RICE"
          rows={ensaioRows("densidade_rice")}
          onRowChange={(i, col, val) => onEnsaioValidacaoChange("densidade_rice", i, col, val)}
          disabled={disabled}
        />
        <EnsaioTable
          title="Densidade Aparente"
          rows={ensaioRows("densidade_aparente")}
          onRowChange={(i, col, val) => onEnsaioValidacaoChange("densidade_aparente", i, col, val)}
          disabled={disabled}
        />
        <EnsaioTable
          title="Relação Fíler/Betume"
          rows={ensaioRows("relacao_filer_betume")}
          onRowChange={(i, col, val) => onEnsaioValidacaoChange("relacao_filer_betume", i, col, val)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}