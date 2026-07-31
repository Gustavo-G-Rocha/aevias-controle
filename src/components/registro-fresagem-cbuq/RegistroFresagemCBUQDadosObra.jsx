import React from "react";
import { useRegistroFresagemCBUQCtx } from "./RegistroFresagemCBUQContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SentidoPistaCheckboxes from "./SentidoPistaCheckboxes";

export default function RegistroFresagemCBUQDadosObra() {
  const {
    formData, setFormData,
    obras, obraSelecionada, regionalSelecionada, projetosDisponiveis,
    canEdit,
    handleObraChange,
  } = useRegistroFresagemCBUQCtx();

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4 border-b pb-2">DADOS DA OBRA</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Obra *</Label>
          <Select value={formData.obra_id} onValueChange={handleObraChange} disabled={!canEdit}>
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  {obra.name} ({obra.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Cliente</Label>
          <Input value={regionalSelecionada?.cliente || ""} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Contratada</Label>
          <Select
            value={formData.contratada}
            onValueChange={(value) => set("contratada", value)}
            disabled={!canEdit || !formData.obra_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione a contratada" /></SelectTrigger>
            <SelectContent>
              {(obraSelecionada?.empreiteiras || []).map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
              {formData.contratada && !(obraSelecionada?.empreiteiras || []).includes(formData.contratada) && (
                <SelectItem value={formData.contratada}>{formData.contratada}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Nº Contrato</Label>
          <Input
            value={formData.numero_contrato}
            onChange={(e) => set("numero_contrato", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Especificação Granulométrica</Label>
          <Input
            value={formData.especificacao_granulometrica}
            onChange={(e) => set("especificacao_granulometrica", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Projeto</Label>
          <Select
            value={formData.project_id}
            onValueChange={(value) => set("project_id", value)}
            disabled={!canEdit}
          >
            <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
            <SelectContent>
              {projetosDisponiveis.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Material</Label>
          <Input
            value={formData.material}
            onChange={(e) => set("material", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Camada</Label>
          <Input
            value={formData.camada}
            onChange={(e) => set("camada", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Rodovia *</Label>
          {(obraSelecionada?.rodovias || []).length > 0 ? (
            <Select
              value={formData.rodovia}
              onValueChange={(value) => set("rodovia", value)}
              disabled={!canEdit || !formData.obra_id}
            >
              <SelectTrigger><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent>
                {obraSelecionada.rodovias.map((rodovia) => (
                  <SelectItem key={rodovia} value={rodovia}>{rodovia}</SelectItem>
                ))}
                {formData.rodovia && !obraSelecionada.rodovias.includes(formData.rodovia) && (
                  <SelectItem value={formData.rodovia}>{formData.rodovia}</SelectItem>
                )}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={formData.rodovia}
              onChange={(e) => set("rodovia", e.target.value)}
              disabled={!canEdit || !formData.obra_id}
              placeholder="Digite a rodovia"
            />
          )}
        </div>

        <SentidoPistaCheckboxes
          value={formData.sentido_pista}
          onChange={(value) => set("sentido_pista", value)}
          disabled={!canEdit}
        />

        <div>
          <Label>Inspetor</Label>
          <Input value={formData.laboratorista_name} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Início da Atividade *</Label>
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => set("data", e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div>
          <Label>Fim da Atividade</Label>
          <Input
            type="date"
            value={formData.data_fim || ""}
            onChange={(e) => set("data_fim", e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>
    </div>
  );
}