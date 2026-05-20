import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import AcoesCorretivasNC from "@/components/checklists/AcoesCorretivasNC";
import { useDiarioObra } from "@/hooks/useDiarioObra";

// ─── Sub-componente: formulário completo ─────────────────────────────────────
const DiarioForm = ({
  formData, handleChange, handleFileChange, handleRemovePhoto, handleSubmit, onCancel,
  obras, regionais, loadingUpload, selectedFileNames, uploadProgress,
  isEditable, isApproved, status,
}) => {
  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null;
  const obraSelecionadaId = obraSelecionada?.id;

  React.useEffect(() => {
    if (regionalSelecionada && regionalSelecionada.cliente !== formData.cliente) {
      handleChange("cliente", regionalSelecionada.cliente || "");
    }
    handleChange("rodovia", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraSelecionadaId]);

  return (
    <form className="space-y-6" onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") e.preventDefault(); }}>
      {status === "rascunho" && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-blue-800">Em Rascunho</p><p className="text-sm text-blue-700">Este registro ainda está em edição e não será visível aos gestores até que você o finalize.</p></div>
        </div>
      )}
      {formData.rejection_reason && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div><p className="font-semibold text-red-800">Motivo da Reprovação:</p><p className="text-sm text-red-700">{formData.rejection_reason}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Obra *</Label>
          <Select value={formData.obra_id || ""} onValueChange={(v) => handleChange("obra_id", v)} required disabled={!isEditable || isApproved}>
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map(o => {
                const reg = regionais.find(r => r.id === o.regional_id);
                return <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}{reg && ` (${reg.nome})`}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        {regionalSelecionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-1 text-sm">
              <p className="text-blue-800"><strong>📍 Regional:</strong> {regionalSelecionada.nome} - {regionalSelecionada.codigo}</p>
              {regionalSelecionada.cliente && <p className="text-blue-800"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input type="date" name="data" value={formData.data} onChange={(e) => handleChange(e.target.name, e.target.value)} required disabled={!isEditable || isApproved} />
        </div>
        <div className="space-y-2">
          <Label>Horário Início *</Label>
          <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => handleChange("jornada", { ...formData.jornada, horario_inicio: e.target.value })} required disabled={!isEditable || isApproved} />
        </div>
        <div className="space-y-2">
          <Label>Horário Fim *</Label>
          <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => handleChange("jornada", { ...formData.jornada, horario_fim: e.target.value })} required disabled={!isEditable || isApproved} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Local do Registro *</Label>
        <Select value={formData.tipo_local} onValueChange={(v) => handleChange("tipo_local", v)} disabled={!isEditable || isApproved}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="campo">Campo</SelectItem>
            <SelectItem value="usina">Usina</SelectItem>
            <SelectItem value="escritorio">Escritório</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.tipo_local !== "escritorio" && (
        <>
          {obraSelecionada?.tipo_obra === "supervisao" && (
            <div className="space-y-2">
              <Label>Empreiteira *</Label>
              <Select value={formData.empreiteira || ""} onValueChange={(v) => handleChange("empreiteira", v)} required disabled={!isEditable || isApproved}>
                <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
                <SelectContent>
                  {obraSelecionada?.empreiteiras?.length > 0
                    ? obraSelecionada.empreiteiras.map(em => <SelectItem key={em} value={em}>{em}</SelectItem>)
                    : <SelectItem value="__none__" disabled>Nenhuma empreiteira cadastrada</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.tipo_local === "campo" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rodovia *</Label>
                {obraSelecionada?.rodovias?.length > 0 ? (
                  <div className="border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto bg-background">
                    {obraSelecionada.rodovias.map(rodovia => {
                      const selected = (formData.rodovia || "").split(" - ").map(r => r.trim()).filter(Boolean);
                      const isChecked = selected.includes(rodovia);
                      return (
                        <label key={rodovia} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-50 ${!isEditable || isApproved ? "opacity-50 pointer-events-none" : ""}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => {
                            const newSel = isChecked ? selected.filter(r => r !== rodovia) : [...selected, rodovia];
                            handleChange("rodovia", newSel.join(" - "));
                          }} className="rounded" />
                          <span className="text-sm">{rodovia}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : <div className="border rounded-md p-2 text-sm text-gray-500">Nenhuma rodovia cadastrada</div>}
                {formData.rodovia && <p className="text-xs text-gray-500">Selecionadas: {formData.rodovia}</p>}
              </div>
              <div className="space-y-2">
                <Label>Trecho *</Label>
                <Input name="trecho" value={formData.trecho} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Ex: km 10 ao km 15" required disabled={!isEditable || isApproved} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Usina *</Label>
              <Select value={formData.usina_selecionada || ""} onValueChange={(v) => handleChange("usina_selecionada", v)} required disabled={!isEditable || isApproved}>
                <SelectTrigger><SelectValue placeholder="Selecione a usina" /></SelectTrigger>
                <SelectContent>
                  {obraSelecionada?.usinas?.length > 0
                    ? obraSelecionada.usinas.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)
                    : <SelectItem value={null} disabled>Nenhuma usina cadastrada</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condições Climáticas *</Label>
              <Select value={formData.condicoes_climaticas} onValueChange={(v) => handleChange("condicoes_climaticas", v)} disabled={!isEditable || isApproved}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ensolarado", "nublado", "chuvoso", "garoa", "vento_forte", "neblina"].map(v => (
                    <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperatura (°C)</Label>
              <Input name="temperatura" type="number" value={formData.temperatura} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Ex: 25" disabled={!isEditable || isApproved} />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Atividades Realizadas *</Label>
        <Textarea name="atividades_realizadas" value={formData.atividades_realizadas} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Descreva as atividades realizadas no dia." rows={4} required disabled={!isEditable || isApproved} />
      </div>

      <div className="space-y-2">
        <Label>Observações Gerais</Label>
        <Textarea name="observacoes" value={formData.observacoes} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Outras observações importantes." rows={3} disabled={!isEditable || isApproved} />
      </div>

      {formData.tipo_local !== "escritorio" && (
        <AcoesCorretivasNC
          acoesRealizadas={formData.acoes_corretivas_realizado}
          acoesDescricao={formData.acoes_corretivas_descricao}
          naoConformidades={formData.nao_conformidades || []}
          onAcoesRealizadasChange={(v) => { handleChange("acoes_corretivas_realizado", v); if (v === false) handleChange("acoes_corretivas_descricao", ""); }}
          onAcoesDescricaoChange={(v) => handleChange("acoes_corretivas_descricao", v)}
          onNaoConformidadesChange={(ncs) => handleChange("nao_conformidades", ncs)}
          disabled={!isEditable || isApproved}
          locaisPermitidos={["CAMPO", "USINA"]}
        />
      )}

      {/* Efetivo de Obra */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader><CardTitle className="text-lg">Efetivo de Obra</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preencher Efetivo de Obra?</Label>
            <div className="flex items-center space-x-4">
              {[true, false].map(val => (
                <label key={String(val)} className="flex items-center">
                  <input type="radio" checked={formData.efetivo_obra_ativo === val} onChange={() => handleChange("efetivo_obra_ativo", val)} disabled={!isEditable || isApproved} className="mr-2" />
                  {val ? "Sim" : "Não"}
                </label>
              ))}
            </div>
          </div>
          {formData.efetivo_obra_ativo && (
            <div className="space-y-6 p-4 border-2 border-green-300 rounded-lg bg-white">
              <div>
                <Label className="text-base font-semibold mb-3 block">Efetivo de Máquinas Operantes</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "motoniveladora", label: "Motoniveladora" }, { key: "caminhao_munck", label: "Caminhão Munck" }, { key: "recicladora", label: "Recicladora" }, { key: "onibus", label: "Ônibus" },
                    { key: "pa_carregadeira", label: "Pá Carregadeira" }, { key: "caminhao_sinalizacao", label: "Caminhão Sinalização" }, { key: "vibro_acabadora", label: "Vibro Acabadora" }, { key: "trator_grade", label: "Trator de Grade" },
                    { key: "retroescavadeira", label: "Retroescavadeira" }, { key: "caminhao_pipa", label: "Caminhão Pipa" }, { key: "rolo_carneiro", label: "Rolo Carneiro" }, { key: "trator_esteira", label: "Trator de Esteira" },
                    { key: "escavadeira_hidraulica", label: "Escavadeira Hidráulica" }, { key: "caminhao_basculante", label: "Caminhão Basculante" }, { key: "rolo_liso", label: "Rolo Liso" }, { key: "veiculo_leve", label: "Veículo Leve" },
                    { key: "mini_carregadeira", label: "Mini Carregadeira" }, { key: "caminhao_cimento", label: "Caminhão Cimento" }, { key: "rolo_pneu", label: "Rolo Pneu" }, { key: "placa_vibratoria", label: "Placa Vibratória" },
                    { key: "extrusora", label: "Extrusora" }, { key: "caminhao_viga", label: "Caminhão Viga" }, { key: "tanque_combustivel", label: "Tanque Combustível" }, { key: "caminhao_prancha", label: "Caminhão Prancha" },
                    { key: "caminhao_espargidor", label: "Caminhão Espargidor" }, { key: "comboio", label: "Comboio" },
                  ].map(item => (
                    <div key={item.key}>
                      <Label className="text-sm">{item.label}</Label>
                      <Input type="number" min="0" value={formData.efetivo_maquinas?.[item.key] || 0}
                        onChange={(e) => handleChange("efetivo_maquinas", { ...formData.efetivo_maquinas, [item.key]: parseInt(e.target.value) || 0 })}
                        disabled={!isEditable || isApproved} className="mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-base font-semibold mb-3 block">Efetivo de Colaboradores</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "encarregado", label: "Encarregado" }, { key: "pedreiro", label: "Pedreiro" }, { key: "topografo", label: "Topógrafo" }, { key: "spoter", label: "Spoter" },
                    { key: "greidista", label: "Greidista" }, { key: "armador", label: "Armador" }, { key: "aux_topografia", label: "Aux. Topografia" }, { key: "seguranca", label: "Segurança" },
                    { key: "operadores", label: "Operadores" }, { key: "carpinteiro", label: "Carpinteiro" }, { key: "laboratorista", label: "Laboratorista" }, { key: "apontador", label: "Apontador" },
                    { key: "motorista", label: "Motorista" }, { key: "ajudante", label: "Ajudante" }, { key: "aux_laboratorio", label: "Aux. Laboratório" }, { key: "pintor", label: "Pintor" },
                    { key: "eletricista", label: "Eletricista" },
                  ].map(item => (
                    <div key={item.key}>
                      <Label className="text-sm">{item.label}</Label>
                      <Input type="number" min="0" value={formData.efetivo_colaboradores?.[item.key] || 0}
                        onChange={(e) => handleChange("efetivo_colaboradores", { ...formData.efetivo_colaboradores, [item.key]: parseInt(e.target.value) || 0 })}
                        disabled={!isEditable || isApproved} className="mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist de Veículo */}
      <Card className="bg-slate-50">
        <CardHeader><CardTitle className="text-lg">Checklist de Veículo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preencher Checklist de Veículo?</Label>
            <Select value={formData.checklist_veiculo_ativo === true ? "sim" : "nao"} onValueChange={(v) => handleChange("checklist_veiculo_ativo", v === "sim")} disabled={!isEditable || isApproved}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.checklist_veiculo_ativo && (
            <div className="space-y-4 mt-4 p-4 border-2 border-blue-200 rounded-lg bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "nome_condutor", label: "Nome do Condutor *", placeholder: "" },
                  { key: "veiculo", label: "Veículo (Modelo) *", placeholder: "Ex: Toyota Corolla" },
                  { key: "placa", label: "Placa *", placeholder: "Ex: ABC-1234" },
                  { key: "empresa", label: "Empresa *", placeholder: "" },
                  { key: "hodometro", label: "Hodômetro *", placeholder: "Ex: 45.230 km" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input value={formData.checklist_veiculo?.[key] || ""} onChange={(e) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, [key]: e.target.value })} disabled={!isEditable || isApproved} placeholder={placeholder} required={formData.checklist_veiculo_ativo} />
                  </div>
                ))}
                <div>
                  <Label>Tipo de Veículo *</Label>
                  <Select value={formData.checklist_veiculo?.tipo_veiculo || "passeio"} onValueChange={(v) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, tipo_veiculo: v })} disabled={!isEditable || isApproved}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passeio">Veículo de Passeio</SelectItem>
                      <SelectItem value="picape">Picape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Áreas Afetadas do Veículo</Label>
                <Textarea value={formData.checklist_veiculo?.areas_afetadas || ""} onChange={(e) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, areas_afetadas: e.target.value })} disabled={!isEditable || isApproved} rows={2} placeholder="Descreva áreas com danos..." />
              </div>

              {/* Condições Gerais */}
              <div>
                <Label className="font-semibold">Condições Gerais</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                  {[
                    { key: "limpeza_externa", label: "Limpeza Externa" }, { key: "limpeza_interna", label: "Limpeza Interna" }, { key: "pneus", label: "Pneus" }, { key: "estepe", label: "Estepe" },
                    ...(formData.checklist_veiculo?.tipo_veiculo === "picape" ? [{ key: "cacamba", label: "Caçamba" }] : []),
                  ].map(item => (
                    <div key={item.key}>
                      <Label className="text-xs">{item.label}</Label>
                      <Select value={formData.checklist_veiculo?.condicoes_gerais?.[item.key] || "bom"} onValueChange={(v) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, condicoes_gerais: { ...formData.checklist_veiculo.condicoes_gerais, [item.key]: v } })} disabled={!isEditable || isApproved}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bom">Bom</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="ruim">Ruim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Luzes e Segurança (agrupadas em tabela compacta) */}
              {[
                { title: "Luzes Traseiras — Direita", groupKey: "luzes_traseiras", side: "direita", items: [{ k: "da_placa", l: "Da placa" }, { k: "luz", l: "Luz" }, { k: "luz_re", l: "Luz de ré" }, { k: "luz_freio", l: "Luz de freio" }, { k: "seta", l: "Seta" }] },
                { title: "Luzes Traseiras — Esquerda", groupKey: "luzes_traseiras", side: "esquerda", items: [{ k: "luz", l: "Luz" }, { k: "luz_re", l: "Luz de ré" }, { k: "luz_freio", l: "Luz de freio" }, { k: "seta", l: "Seta" }] },
                { title: "Luzes Dianteiras — Direita", groupKey: "luzes_dianteiras", side: "direita", items: [{ k: "farol_alto", l: "Farol alto" }, { k: "farol_baixo", l: "Farol baixo" }, { k: "seta", l: "Seta" }, { k: "neblina", l: "Neblina" }] },
                { title: "Luzes Dianteiras — Esquerda", groupKey: "luzes_dianteiras", side: "esquerda", items: [{ k: "farol_alto", l: "Farol alto" }, { k: "farol_baixo", l: "Farol baixo" }, { k: "seta", l: "Seta" }, { k: "neblina", l: "Neblina" }] },
              ].map(({ title, groupKey, side, items }) => (
                <div key={title} className="border rounded p-3 bg-blue-50">
                  <Label className="font-semibold text-sm mb-2 block">{title}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {items.map(({ k, l }) => (
                      <div key={k}>
                        <Label className="text-xs">{l}</Label>
                        <Select value={formData.checklist_veiculo?.[groupKey]?.[side]?.[k] || "sim"}
                          onValueChange={(v) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, [groupKey]: { ...formData.checklist_veiculo[groupKey], [side]: { ...formData.checklist_veiculo[groupKey][side], [k]: v } } })}
                          disabled={!isEditable || isApproved}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="na">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Segurança */}
              <div>
                <Label className="font-semibold text-base">Segurança</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    { k: "alarme", l: "Alarme" }, { k: "buzina", l: "Buzina" }, { k: "chave_roda", l: "Chave de Roda" }, { k: "cintos", l: "Cintos" },
                    { k: "documentos", l: "Documentos" }, { k: "extintor", l: "Extintor" }, { k: "limpadores", l: "Limpadores" }, { k: "macaco", l: "Macaco" },
                    { k: "painel", l: "Painel" }, { k: "retrovisor_interno", l: "Retrovisor Interno" }, { k: "retrovisor_direito", l: "Retrovisor Direito" },
                    { k: "retrovisor_esquerdo", l: "Retrovisor Esquerdo" }, { k: "travas", l: "Travas" }, { k: "triangulo", l: "Triângulo" },
                  ].map(({ k, l }) => (
                    <div key={k}>
                      <Label className="text-xs">{l}</Label>
                      <Select value={formData.checklist_veiculo?.seguranca?.[k] || "sim"} onValueChange={(v) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, seguranca: { ...formData.checklist_veiculo.seguranca, [k]: v } })} disabled={!isEditable || isApproved}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                          <SelectItem value="na">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motor */}
              <div>
                <Label className="font-semibold text-base">Motor</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {[
                    { k: "acelerador", l: "Acelerador" }, { k: "agua_limpador", l: "Água do limpador" }, { k: "agua_radiador", l: "Água do radiador" },
                    { k: "embreagem", l: "Embreagem" }, { k: "freio", l: "Freio" }, { k: "freio_mao", l: "Freio de mão" },
                    { k: "oleo_freio", l: "Óleo do freio" }, { k: "oleo_moto", l: "Óleo do moto" }, { k: "tanque_partida", l: "Tanque de partida" },
                  ].map(({ k, l }) => (
                    <div key={k}>
                      <Label className="text-xs">{l}</Label>
                      <Select value={formData.checklist_veiculo?.motor?.[k] || "sim"} onValueChange={(v) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, motor: { ...formData.checklist_veiculo.motor, [k]: v } })} disabled={!isEditable || isApproved}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                          <SelectItem value="na">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Observações do Veículo</Label>
                <Textarea value={formData.checklist_veiculo?.observacoes || ""} onChange={(e) => handleChange("checklist_veiculo", { ...formData.checklist_veiculo, observacoes: e.target.value })} disabled={!isEditable || isApproved} rows={3} placeholder="Observações adicionais..." />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      <div className="space-y-2">
        <Label>Relatório Fotográfico</Label>
        {isEditable && !isApproved && (
          <div>
            <Input id="fotos" type="file" multiple accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleFileChange} disabled={loadingUpload} className="hidden" />
            <Label htmlFor="fotos" className={`flex items-center justify-between w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm cursor-pointer hover:bg-slate-50 ${loadingUpload ? "opacity-50 cursor-not-allowed" : ""}`}>
              <span className="truncate text-slate-500">{selectedFileNames}</span>
              <span className="flex-shrink-0 ml-4 px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700">{loadingUpload ? "Enviando..." : "Escolher Ficheiros"}</span>
            </Label>
          </div>
        )}
        {loadingUpload && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Carregando fotos...</p>
            {uploadProgress.length > 0 && (
              <div className="text-xs space-y-1 mt-2">
                {uploadProgress.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-4">
                      {p.status === "pending" && "⚪"}
                      {p.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      {p.status === "success" && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {p.status === "error" && <XCircle className="w-3 h-3 text-red-500" />}
                    </span>
                    <span className={p.status === "error" ? "text-red-600" : "text-gray-600"}>{p.fileName} - {p.status === "pending" ? "Aguardando" : p.status === "uploading" ? "Enviando..." : p.status === "success" ? "Sucesso" : `Erro: ${p.error}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {formData.fotos?.map((url, i) => (
            <div key={i} className="relative group">
              <picture><source srcSet={url} /><img src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded-md border" width="auto" height="128" /></picture>
              {isEditable && !isApproved && (
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(i)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {(!formData.fotos || formData.fotos.length === 0) && !loadingUpload && <p className="text-sm text-gray-500 mt-2">Nenhuma foto adicionada.</p>}
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        {isEditable && !isApproved && (
          <>
            <Button type="button" variant="outline" disabled={loadingUpload} onClick={(e) => handleSubmit(e, "rascunho")} className="border-blue-500 text-blue-600 hover:bg-blue-50">
              <Save className="mr-2 h-4 w-4" /> Salvar Progresso
            </Button>
            <Button type="button" disabled={loadingUpload} onClick={(e) => handleSubmit(e, "finalizado")}>
              <Save className="mr-2 h-4 w-4" /> Finalizar
            </Button>
          </>
        )}
        {isApproved && (
          <Badge className="bg-green-500 hover:bg-green-500 px-4 py-2 text-md">
            <CheckCircle className="mr-2 h-4 w-4" /> Aprovado
          </Badge>
        )}
      </div>
    </form>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DiarioObraPage() {
  const {
    loading, user, obras, regionais, editingDiarioOriginal,
    formData, handleChange, loadingUpload, selectedFileNames, uploadProgress,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
    isApproved, isEditable,
  } = useDiarioObra();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editingDiarioOriginal?.id ? "Editar Diário de Obra" : "Novo Diário de Obra"}</CardTitle>
            <CardDescription>
              {editingDiarioOriginal?.id
                ? `Editando registro de ${new Date(editingDiarioOriginal.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`
                : "Preencha as informações abaixo para criar um novo registro."}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <DiarioForm
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              handleRemovePhoto={handleRemovePhoto}
              handleSubmit={handleSubmit}
              onCancel={handleCancel}
              obras={obras}
              regionais={regionais}
              user={user}
              loadingUpload={loadingUpload}
              selectedFileNames={selectedFileNames}
              uploadProgress={uploadProgress}
              isEditable={isEditable}
              isApproved={isApproved}
              status={formData.status}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}