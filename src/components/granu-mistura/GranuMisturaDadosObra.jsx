import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GranuMisturaDadosObra({
  formData, obras, filteredProjects, faixasDisponiveis, faixaGran,
  regionalSelecionada, obraSelecionada,
  editingId, isApproved,
  handleChange,
}) {
  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-base">Dados da Obra</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {/* Coluna 1 */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold">CLIENTE</Label>
              <Input value={regionalSelecionada?.cliente || ""} disabled className="bg-gray-50 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs font-bold">DATA DO ENSAIO *</Label>
              <Input type="date" value={formData.data_ensaio} onChange={e => handleChange("data_ensaio", e.target.value)} disabled={!!editingId || isApproved} className="text-xs" />
            </div>
            <div>
              <Label className="text-xs font-bold">OBRA *</Label>
              <Select value={formData.obra_id} onValueChange={v => handleChange("obra_id", v)} disabled={!!editingId || isApproved}>
                <SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger>
                <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold">RODOVIA</Label>
              <Select value={formData.rodovia} onValueChange={v => handleChange("rodovia", v)} disabled={isApproved}>
                <SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger>
                <SelectContent>{(obraSelecionada?.rodovias || []).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold">TRECHO</Label>
              <Input value={formData.trecho} onChange={e => handleChange("trecho", e.target.value)} disabled={isApproved} className="text-xs" placeholder="Ex: km 12+300 ao km 15+100" />
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold">CAMADA</Label>
              <Input value={formData.camada} onChange={e => handleChange("camada", e.target.value)} disabled={isApproved} className="text-xs" placeholder="Ex: Capa de rolamento" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold">MATERIAL</Label>
              <Select value={formData.material} onValueChange={v => { handleChange("material", v); handleChange("project_id", ""); handleChange("faixa", ""); }} disabled={isApproved}>
                <SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAUQ">CAUQ</SelectItem>
                  <SelectItem value="MRAF">MRAF</SelectItem>
                  <SelectItem value="BGS">BGS</SelectItem>
                  <SelectItem value="OUTRO">OUTRO</SelectItem>
                </SelectContent>
              </Select>
              {formData.material === "OUTRO" && (
                <Input value={formData.material_outro || ""} onChange={e => handleChange("material_outro", e.target.value)} disabled={isApproved} className="text-xs" placeholder="Especifique o material ensaiado" />
              )}
            </div>
            {formData.material !== "OUTRO" && (
              <div>
                <Label className="text-xs font-bold">PROJETO *</Label>
                <Select value={formData.numero_projeto} onValueChange={v => handleChange("numero_projeto", v)} disabled={!!editingId || isApproved}>
                  <SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger>
                  <SelectContent>{filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {formData.material === "OUTRO" && (
              <div>
                <Label className="text-xs font-bold">FAIXA ESPECIFICADA</Label>
                <Select value={formData.faixa} onValueChange={v => handleChange("faixa", v)} disabled={isApproved}>
                  <SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger>
                  <SelectContent>{faixasDisponiveis.filter(f => f.tipo === "CAMADAS_GRANULARES").map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {formData.material !== "OUTRO" && (
              <div>
                <Label className="text-xs font-bold">FAIXA</Label>
                <Input value={formData.faixa} onChange={e => handleChange("faixa", e.target.value)} disabled={isApproved} className="text-xs" placeholder={faixaGran?.nome || ""} />
              </div>
            )}
            <div>
              <Label className="text-xs font-bold">PEDREIRA</Label>
              <Input value={formData.pedreira} onChange={e => handleChange("pedreira", e.target.value)} disabled={isApproved} className="text-xs" placeholder="Ex: Pedreira São João" />
            </div>
          </div>

          {/* Coluna 3 */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold">LOCAL DE COLETA</Label>
              <Input value={formData.local_coleta} onChange={e => handleChange("local_coleta", e.target.value)} disabled={isApproved} className="text-xs" placeholder="Ex: Usina / Pista - km 13+500" />
            </div>
            <div>
              <Label className="text-xs font-bold">HORÁRIO</Label>
              <Input type="time" value={formData.horario} onChange={e => handleChange("horario", e.target.value)} disabled={isApproved} className="text-xs" />
            </div>
            <div>
              <Label className="text-xs font-bold">LABORATORISTA</Label>
              <Input value={formData.laboratorista_name} onChange={e => handleChange("laboratorista_name", e.target.value)} disabled={isApproved} className="text-xs bg-gray-50" placeholder="Nome do laboratorista" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}