import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BoletimSondagemTradoDadosGerais({ formData, setFormData, obras, isEditable, editingBoletim, handleObraChange, regionais }) {
  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Obra *</Label>
            <select
              value={formData.obra_id}
              onChange={(e) => handleObraChange(e.target.value, obras, regionais)}
              disabled={!isEditable || !!editingBoletim}
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione a obra</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.name} — {obra.code}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Input value={formData.cliente} onChange={e => setFormData(p => ({ ...p, cliente: e.target.value }))} disabled={!isEditable} className="h-10" />
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={formData.data} onChange={e => setFormData(p => ({ ...p, data: e.target.value }))} disabled={!isEditable} required className="h-10" />
          </div>
          <div>
            <Label>Rodovia</Label>
            <select
              value={formData.rodovia}
              onChange={e => setFormData(p => ({ ...p, rodovia: e.target.value }))}
              disabled={!isEditable || !formData.obra_id}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione a rodovia</option>
              {(obras.find(o => o.id === formData.obra_id)?.rodovias || []).map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>KM</Label>
            <Input value={formData.km} onChange={e => setFormData(p => ({ ...p, km: e.target.value }))} disabled={!isEditable} placeholder="Ex: 125+300" className="h-10" />
          </div>
          <div>
            <Label>Pista</Label>
            <Input value={formData.pista} onChange={e => setFormData(p => ({ ...p, pista: e.target.value }))} disabled={!isEditable} className="h-10" />
          </div>
          <div>
            <Label>Bordo</Label>
            <Input value={formData.bordo} onChange={e => setFormData(p => ({ ...p, bordo: e.target.value }))} disabled={!isEditable} className="h-10" />
          </div>
          <div>
            <Label>Furo</Label>
            <Input value={formData.furo} onChange={e => setFormData(p => ({ ...p, furo: e.target.value }))} disabled={!isEditable} placeholder="Ex: T-01" className="h-10" />
          </div>
          <div>
            <Label>Operador</Label>
            <Input value={formData.operador} readOnly className="h-10 bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}