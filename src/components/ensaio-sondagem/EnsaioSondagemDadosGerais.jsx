import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <select
              id="metodo_ensaio"
              value={formData.metodo_ensaio}
              onChange={e => setFormData({ ...formData, metodo_ensaio: e.target.value })}
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-2"
            >
              <option value="DNIT 428/2022">DNIT 428/2022 (usa peso saturado e imerso)</option>
              <option value="DNER 117/94">DNER 117/94 (usa apenas peso imerso)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              {formData.metodo_ensaio === "DNIT 428/2022"
                ? "Volume = Peso Saturado - Peso Imerso | Densidade = (Peso ao Ar / Volume) × Dens. Água"
                : "Volume = Peso ao Ar - Peso Imerso | Densidade = Peso ao Ar / Volume"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Obra */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Dados da Obra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="obra_id">Obra *</Label>
              <select
                id="obra_id"
                value={formData.obra_id}
                onChange={e => setFormData({ ...formData, obra_id: e.target.value, project_id: "" })}
                required
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione a obra</option>
                {obras.map(obra => (
                  <option key={obra.id} value={obra.id}>{obra.name} - {obra.code}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="project_id">Projeto</Label>
              <select
                id="project_id"
                value={formData.project_id}
                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                disabled={!formData.obra_id}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Selecione o projeto (opcional)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
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
              <select
                id="rodovia"
                value={formData.rodovia}
                onChange={e => setFormData({ ...formData, rodovia: e.target.value })}
                required={isFinalizado}
                disabled={!formData.obra_id}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione a rodovia</option>
                {obras.find(o => o.id === formData.obra_id)?.rodovias?.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
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
              <select id="servico" value={formData.servico}
                onChange={e => setFormData({ ...formData, servico: e.target.value })}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione o serviço</option>
                <option value="Capa/Reperfilagem">Capa/Reperfilagem (GC: 97-101%)</option>
                <option value="Remendos">Remendos (GC: 95-101%)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ensaio_realizado_por">Ensaio realizado por:</Label>
              <select id="ensaio_realizado_por" value={formData.ensaio_realizado_por}
                onChange={e => setFormData({ ...formData, ensaio_realizado_por: e.target.value })}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="Afirma Evias">Afirma Evias</option>
                <option value="Empreiteira">Empreiteira</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Projeto */}
      <Card className="bg-slate-50">
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