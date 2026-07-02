import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GOLPES_POR_ENERGIA } from "@/utils/ensaioProctorUtils";

export default function EnsaioProctorDadosGerais({ form, setForm, obras, projetos, handleObraChange, handleEnergiaChange }) {
  return (
    <>
      {/* Dados da Obra */}
      <Card className="bg-card border border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Dados da Obra</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Obra *</Label>
              <Select value={form.obra_id} onValueChange={(id) => handleObraChange(id, obras)}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>{obras.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Projeto</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm(prev => ({ ...prev, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                <SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-foreground">Cliente</Label><Input value={form.cliente} readOnly className="bg-gray-100/50 cursor-not-allowed" /></div>
            <div><Label className="text-foreground">Rodovia *</Label><Input value={form.rodovia} onChange={(e) => setForm(prev => ({ ...prev, rodovia: e.target.value }))} /></div>
            <div><Label className="text-foreground">Trecho *</Label><Input value={form.trecho} onChange={(e) => setForm(prev => ({ ...prev, trecho: e.target.value }))} /></div>
            <div><Label className="text-foreground">Local de Coleta *</Label><Input value={form.local_coleta} onChange={(e) => setForm(prev => ({ ...prev, local_coleta: e.target.value }))} /></div>
            <div><Label className="text-foreground">Data do Ensaio *</Label><Input type="date" value={form.data_ensaio} onChange={(e) => setForm(prev => ({ ...prev, data_ensaio: e.target.value }))} /></div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Material */}
      <Card className="bg-card border border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Dados do Material</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-foreground">Camada *</Label><Input value={form.camada} onChange={(e) => setForm(prev => ({ ...prev, camada: e.target.value }))} /></div>
            <div><Label className="text-foreground">Material *</Label><Input value={form.material} onChange={(e) => setForm(prev => ({ ...prev, material: e.target.value }))} /></div>
            <div><Label className="text-foreground">Procedência *</Label><Input value={form.procedencia} onChange={(e) => setForm(prev => ({ ...prev, procedencia: e.target.value }))} /></div>
            <div>
              <Label className="text-foreground">Energia de Compactação</Label>
              <Select value={form.energia_compactacao} onValueChange={handleEnergiaChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(GOLPES_POR_ENERGIA).map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Nº de Golpes</Label>
              <Input type="number" value={form.num_golpes} readOnly className="bg-gray-100/50 cursor-not-allowed" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}