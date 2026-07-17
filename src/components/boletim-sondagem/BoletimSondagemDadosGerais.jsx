import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BoletimSondagemDadosGerais({ formData, setFormData, obras, regionais, isEditable, editingBoletim, handleObraChange }) {
  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Obra *</Label>
            <Select value={formData.obra_id} onValueChange={(v) => handleObraChange(v, obras, regionais)} disabled={!isEditable || !!editingBoletim}>
              <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent title="Obra">
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name} — {obra.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Input value={formData.cliente} onChange={e => setFormData(p => ({ ...p, cliente: e.target.value }))} disabled={!isEditable} placeholder="Do cadastro da obra" className="h-10" />
          </div>
          <div>
            <Label>Data *</Label>
            <Input type="date" value={formData.data} onChange={e => setFormData(p => ({ ...p, data: e.target.value }))} disabled={!isEditable} required className="h-10" />
          </div>
          <div>
            <Label>Rodovia</Label>
            <Select value={formData.rodovia} onValueChange={(v) => setFormData(p => ({ ...p, rodovia: v }))} disabled={!isEditable || !formData.obra_id}>
              <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
              <SelectContent title="Rodovia">
                {(obras.find(o => o.id === formData.obra_id)?.rodovias || []).map((r, i) => (
                  <SelectItem key={i} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>KM</Label>
            <Input value={formData.km} onChange={e => setFormData(p => ({ ...p, km: e.target.value }))} disabled={!isEditable} placeholder="Ex: 125+300" className="h-10" />
          </div>
          <div>
            <Label>Pista</Label>
            <Input value={formData.pista} onChange={e => setFormData(p => ({ ...p, pista: e.target.value }))} disabled={!isEditable} placeholder="Ex: Norte" className="h-10" />
          </div>
          <div>
            <Label>Bordo</Label>
            <Input value={formData.bordo} onChange={e => setFormData(p => ({ ...p, bordo: e.target.value }))} disabled={!isEditable} placeholder="Ex: Direito" className="h-10" />
          </div>
          <div>
            <Label>Furo</Label>
            <Input value={formData.furo} onChange={e => setFormData(p => ({ ...p, furo: e.target.value }))} disabled={!isEditable} placeholder="Ex: F-01" className="h-10" />
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