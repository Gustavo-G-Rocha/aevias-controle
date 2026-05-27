import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { CopyIdButton } from "./CopyIdButton";

export function DadosObraSection({
  obras,
  obraId,
  onObraChange,
  form,
  onFormChange,
  tipoChecklist,
  onTipoChecklistChange,
  checklists,
  checklistId,
  onChecklistChange,
  loadingChecklists
}) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-[#00233B] text-base bg-[#BFCF99]/30 px-3 py-1 rounded">
          DADOS DA OBRA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#00233B]">Obra *</Label>
            <select
              value={obraId}
              onChange={e => onObraChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
            >
              <option value="">Selecione a obra</option>
              {obras.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-[#00233B]">Cliente</Label>
            <Input
              value={form.cliente}
              onChange={e => onFormChange({ ...form, cliente: e.target.value })}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
          <div>
            <Label className="text-[#00233B]">Rodovia</Label>
            <Input
              value={form.rodovia}
              onChange={e => onFormChange({ ...form, rodovia: e.target.value })}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
          <div>
            <Label className="text-[#00233B]">Trecho</Label>
            <Input
              value={form.trecho}
              onChange={e => onFormChange({ ...form, trecho: e.target.value })}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
          <div>
            <Label className="text-[#00233B]">Data da NC *</Label>
            <Input
              type="date"
              value={form.data_nc}
              onChange={e => onFormChange({ ...form, data_nc: e.target.value })}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
        </div>

        {/* Checklist de referência */}
        <div className="border-t border-white/20 pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#00233B]">Tipo de Registro (referência)</Label>
              <select
                value={tipoChecklist}
                onChange={e => onTipoChecklistChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
              >
                <option value="">Nenhum</option>
                <option value="DiarioObra">Diário de Obra</option>
                <option value="ChecklistUsina">Checklist de Usina</option>
                <option value="ChecklistAplicacao">Checklist de Aplicação</option>
                <option value="ChecklistMRAF">Checklist MRAF</option>
                <option value="ChecklistConcretagem">Checklist de Concretagem</option>
                <option value="ChecklistTerraplanagem">Checklist de Terraplanagem</option>
                <option value="ChecklistReciclagem">Checklist de Reciclagem</option>
              </select>
            </div>
            {tipoChecklist && (
              <div>
                <Label className="text-[#00233B]">Selecionar Checklist pelo ID</Label>
                <Input
                  value={checklistId}
                  onChange={e => onChecklistChange(e.target.value)}
                  placeholder="Cole o ID do checklist aqui..."
                  className="bg-white/50 border-white/20 text-[#00233B] font-mono text-sm"
                />
                {checklistId && checklists.find(c => c.id === checklistId) && (
                  <p className="text-xs text-green-700 mt-1">
                    ✓ Checklist encontrado: {checklists.find(c => c.id === checklistId)?.data}
                    {checklists.find(c => c.id === checklistId)?.rodovia ? ` – ${checklists.find(c => c.id === checklistId).rodovia}` : ""}
                  </p>
                )}
                {checklistId && !checklists.find(c => c.id === checklistId) && (
                  <p className="text-xs text-orange-600 mt-1">ID não encontrado nos checklists carregados.</p>
                )}
              </div>
            )}
          </div>

          {tipoChecklist && (
            <div>
              <Label className="text-[#00233B] text-xs mb-1 block">
                Checklists disponíveis (clique no ID para copiar):
              </Label>
              {loadingChecklists ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : checklists.length === 0 ? (
                <p className="text-xs text-[#00233B]/60 italic">Nenhum checklist encontrado para esta obra.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-white/20 rounded-md divide-y divide-white/10">
                  {checklists.map(c => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-3 py-2 text-xs hover:bg-white/20 transition-colors ${
                        checklistId === c.id ? "bg-[#BFCF99]/20" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[#00233B]">{c.data}</span>
                        {c.rodovia && <span className="text-[#00233B]/70"> – {c.rodovia}</span>}
                        {c.trecho && <span className="text-[#00233B]/60"> / {c.trecho}</span>}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <CopyIdButton id={c.id} />
                        <button
                          type="button"
                          onClick={() => onChecklistChange(c.id)}
                          className="text-[10px] bg-[#00233B]/10 hover:bg-[#00233B]/20 text-[#00233B] px-2 py-0.5 rounded transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}