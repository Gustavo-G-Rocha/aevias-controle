import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EnsaioSondagemDadosGerais({ formData, setFormData, obras, projects }) {
  const isFinalizado = formData.status === 'finalizado';

  return (
    <>
      {/* Método de Ensaio */}
      <Card className="bg-muted/30 border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Método de Ensaio</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="metodo_ensaio" className="text-base font-semibold">Método de Ensaio *</Label>
            <Select value={formData.metodo_ensaio} onValueChange={(v) => setFormData({ ...formData, metodo_ensaio: v })}>
              <SelectTrigger className="h-10 bg-background mt-2"><SelectValue placeholder="Selecione o método" /></SelectTrigger>
              <SelectContent title="Método de Ensaio">
                <SelectItem value="DNIT 428/2022">DNIT 428/2022 (usa peso saturado e imerso)</SelectItem>
                <SelectItem value="DNER 117/94">DNER 117/94 (usa apenas peso imerso)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              {formData.metodo_ensaio === "DNIT 428/2022"
                ? "Volume = Peso Saturado - Peso Imerso | Densidade = (Peso ao Ar / Volume) × Dens. Água"
                : "Volume = Peso ao Ar - Peso Imerso | Densidade = Peso ao Ar / Volume"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Obra */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Dados da Obra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="obra_id">Obra *</Label>
              <Select value={formData.obra_id} onValueChange={(v) => setFormData({ ...formData, obra_id: v, project_id: "" })}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent title="Obra">
                  {obras.map(obra => (
                    <SelectItem key={obra.id} value={obra.id}>{obra.name} - {obra.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project_id">Projeto</Label>
              <Select value={formData.project_id} onValueChange={(v) => setFormData({ ...formData, project_id: v })} disabled={!formData.obra_id}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione o projeto (opcional)" /></SelectTrigger>
                <SelectContent title="Projeto">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data">Data {isFinalizado && '*'}</Label>
              <Input type="date" id="data" value={formData.data}
                onChange={e => setFormData({ ...formData, data: e.target.value })}
                required={isFinalizado} />
            </div>
            <div>
              <Label htmlFor="rodovia">Rodovia {isFinalizado && '*'}</Label>
              <Select value={formData.rodovia} onValueChange={(v) => setFormData({ ...formData, rodovia: v })} disabled={!formData.obra_id}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione a rodovia" /></SelectTrigger>
                <SelectContent title="Rodovia">
                  {obras.find(o => o.id === formData.obra_id)?.rodovias?.map((r, i) => (
                    <SelectItem key={i} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trecho">Trecho {isFinalizado && '*'}</Label>
              <Input id="trecho" value={formData.trecho}
                onChange={e => setFormData({ ...formData, trecho: e.target.value })}
                required={isFinalizado} placeholder="Descrição do trecho" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="usina_fornecedora">Usina Fornecedora</Label>
              <Input id="usina_fornecedora" value={formData.usina_fornecedora}
                onChange={e => setFormData({ ...formData, usina_fornecedora: e.target.value })}
                placeholder="Nome da usina" />
            </div>
            <div>
              <Label htmlFor="servico">Serviço</Label>
              <Select value={formData.servico} onValueChange={(v) => setFormData({ ...formData, servico: v })}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                <SelectContent title="Serviço">
                  <SelectItem value="Capa/Reperfilagem">Capa/Reperfilagem (GC: 97-101%)</SelectItem>
                  <SelectItem value="Remendos">Remendos (GC: 95-101%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ensaio_realizado_por">Ensaio realizado por:</Label>
              <Select value={formData.ensaio_realizado_por} onValueChange={(v) => setFormData({ ...formData, ensaio_realizado_por: v })}>
                <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent title="Ensaio realizado por">
                  <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                  <SelectItem value="Empreiteira">Empreiteira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Projeto */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros de Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="volume_vazios_projeto">Volume Vazios Projeto (%)</Label>
              <Input type="number" step="0.01" id="volume_vazios_projeto"
                value={formData.volume_vazios_projeto}
                onChange={e => setFormData({ ...formData, volume_vazios_projeto: e.target.value })}
                placeholder="Ex: 4.5" />
            </div>
            <div>
              <Label htmlFor="dens_aparente_projeto">Dens. Aparente Projeto (g/cm³)</Label>
              <Input type="number" step="0.0001" id="dens_aparente_projeto"
                value={formData.dens_aparente_projeto}
                onChange={e => setFormData({ ...formData, dens_aparente_projeto: e.target.value })}
                placeholder="Ex: 2.450" />
            </div>
            <div>
              <Label htmlFor="dens_rice_projeto">Dens. RICE Projeto (g/cm³)</Label>
              <Input type="number" step="0.0001" id="dens_rice_projeto"
                value={formData.dens_rice_projeto}
                onChange={e => setFormData({ ...formData, dens_rice_projeto: e.target.value })}
                placeholder="Ex: 2.560" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fator_correcao_prensa">Fator Correção Prensa</Label>
              <Input type="number" step="0.0001" id="fator_correcao_prensa"
                value={formData.fator_correcao_prensa}
                onChange={e => setFormData({ ...formData, fator_correcao_prensa: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="dens_agua_25c">Dens. Água 25°C (g/cm³)</Label>
              <Input type="number" step="0.0001" id="dens_agua_25c"
                value={0.9971} readOnly className="bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}