import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SecaoDescricao({ formData, onChange, disabled }) {
  const field = (label, key, type = "text") => (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-slate-600">{label}</Label>
      <Input
        type={type}
        value={formData[key] || ""}
        onChange={(e) => onChange(key, e.target.value)}
        disabled={disabled}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">1 - DESCRIÇÃO</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-1">
        {field("Razão Social", "razao_social")}
        {field("Localização", "localizacao")}
        {field("Interessado", "interessado")}
        {field("Marca da Usina", "marca_usina")}
        {field("Responsável Técnico", "responsavel_tecnico")}
        {field("Nº de Série", "numero_serie")}
        {field("Telefone", "telefone")}
        {field("Fornecimento Agregado", "fornecimento_agregado")}
        {field("E-Mail", "email")}
        {field("Mineralogia", "mineralogia")}
        {field("Data da Vistoria", "data_vistoria", "date")}
        {field("Avaliador", "avaliador")}
        {field("CNPJ", "cnpj")}
        {field("Validade", "validade", "date")}
      </div>
    </div>
  );
}