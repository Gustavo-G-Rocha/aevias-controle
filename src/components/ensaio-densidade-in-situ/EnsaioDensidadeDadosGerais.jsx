import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { listarUsuarios } from "@/services/usuariosService";

export default function EnsaioDensidadeDadosGerais({ formData, setFormData, obras, regionais, isEditable, handleGlobalDataChange, handleProctorChange, projects = [] }) {
  const handleObraChange = (obraId) => {
    const obra = obras.find(o => o.id === obraId);
    const regional = obra ? regionais.find(r => r.id === obra.regional_id) : null;

    setFormData(prev => ({ ...prev, obra_id: obraId, project_id: '' }));

    if (regional?.gestor_contrato_responsavel) {
      listarUsuarios().then(allUsers => {
        const gestor = allUsers.find(
          u => u.email.toLowerCase() === regional.gestor_contrato_responsavel.toLowerCase()
        );
        if (gestor) {
          setFormData(prev => ({
            ...prev,
            engenheiro_responsavel: gestor.laboratorista_name || gestor.full_name,
          }));
        }
      }).catch(() => {});
    }
  };

  // Projetos BGS disponíveis para a obra selecionada
  const obra = obras.find(o => o.id === formData.obra_id);
  const regional = obra ? regionais.find(r => r.id === obra.regional_id) : null;
  const projectIdsDaRegional = regional?.project_ids || [];
  const projetosBGS = projects.filter(p =>
    (p.tipo_projeto === 'BGS' || p.tipo_projeto === 'CAMADAS_GRANULARES') && projectIdsDaRegional.includes(p.id)
  );

  const handleProjectChange = (projectId) => {
    const projeto = projects.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      dados_proctor: {
        ...prev.dados_proctor,
        densidade_seca_max: projeto?.densidade_seca_max || prev.dados_proctor.densidade_seca_max || null,
        umidade_otima: projeto?.umidade_otima || prev.dados_proctor.umidade_otima || null,
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Dados da Obra */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Dados da Obra</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <select
              id="obra_id"
              value={formData.obra_id}
              onChange={(e) => handleObraChange(e.target.value)}
              disabled={!isEditable}
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione a obra</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.name} - {obra.code}</option>
              ))}
            </select>
          </div>

          {projetosBGS.length > 0 && (
            <div>
              <Label htmlFor="project_id">Projeto BGS / Camadas Granulares (opcional)</Label>
              <select
                id="project_id"
                value={formData.project_id || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={!isEditable}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione o projeto</option>
                {projetosBGS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Preenche automaticamente a densidade seca máxima do Proctor</p>
            </div>
          )}

          <div>
            <Label htmlFor="data_ensaio">Data do Ensaio *</Label>
            <Input
              id="data_ensaio"
              type="date"
              value={formData.data_ensaio}
              onChange={(e) => setFormData(prev => ({ ...prev, data_ensaio: e.target.value }))}
              disabled={!isEditable}
              required
            />
          </div>

          <div>
            <Label htmlFor="horario">Horário</Label>
            <Input
              id="horario"
              type="time"
              value={formData.horario}
              onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
              disabled={!isEditable}
            />
          </div>

          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            <select
              id="rodovia"
              value={formData.rodovia}
              onChange={(e) => setFormData(prev => ({ ...prev, rodovia: e.target.value }))}
              disabled={!isEditable || !formData.obra_id}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione a rodovia</option>
              {obras.find(o => o.id === formData.obra_id)?.rodovias?.map((rodovia, idx) => (
                <option key={idx} value={rodovia}>{rodovia}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input id="trecho" value={formData.trecho} onChange={(e) => setFormData(prev => ({ ...prev, trecho: e.target.value }))} disabled={!isEditable} placeholder="Ex: km 10 ao km 25" />
          </div>

          <div>
            <Label htmlFor="sub_trecho">Sub-Trecho</Label>
            <Input id="sub_trecho" value={formData.sub_trecho} onChange={(e) => setFormData(prev => ({ ...prev, sub_trecho: e.target.value }))} disabled={!isEditable} />
          </div>

          <div>
            <Label htmlFor="camada">Camada</Label>
            <Input id="camada" value={formData.camada} onChange={(e) => setFormData(prev => ({ ...prev, camada: e.target.value }))} disabled={!isEditable} placeholder="Ex: Base, Subleito" />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Input id="material" value={formData.material} onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))} disabled={!isEditable} placeholder="Ex: Solo argiloso" />
          </div>

          <div>
            <Label htmlFor="procedencia">Procedência</Label>
            <Input id="procedencia" value={formData.procedencia} onChange={(e) => setFormData(prev => ({ ...prev, procedencia: e.target.value }))} disabled={!isEditable} />
          </div>

          <div>
            <Label htmlFor="engenheiro_responsavel">Engenheiro Responsável</Label>
            <Input
              id="engenheiro_responsavel"
              value={formData.engenheiro_responsavel || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, engenheiro_responsavel: e.target.value }))}
              disabled={!isEditable}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Switch
            id="substituicao"
            checked={formData.substituicao_retido_3_4}
            onCheckedChange={(checked) => handleGlobalDataChange('substituicao_retido_3_4', checked)}
            disabled={!isEditable}
          />
          <Label htmlFor="substituicao" className="cursor-pointer">
            Ensaio com substituição do material retido na 3/4"
          </Label>
        </div>

        {formData.substituicao_retido_3_4 && (
          <div className="mt-4">
            <Label htmlFor="densidade_real_retida">Densidade Real Retida 3/4" (g/cm³)</Label>
            <Input
              id="densidade_real_retida"
              type="number"
              step="0.001"
              value={formData.densidade_real_retida_3_4 || ''}
              onChange={(e) => handleGlobalDataChange('densidade_real_retida_3_4', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!isEditable}
              placeholder="Ex: 2.650"
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Dados da Areia (Calibração) */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Dados da Areia (Calibração)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="densidade_areia">Densidade da Areia (g/cm³) *</Label>
              <Input
                id="densidade_areia"
                type="number"
                step="0.001"
                value={formData.densidade_areia || ''}
                onChange={(e) => handleGlobalDataChange('densidade_areia', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 1.450"
              />
            </div>
            <div>
              <Label htmlFor="peso_areia_funil">Peso da Areia no Funil (g) *</Label>
              <Input
                id="peso_areia_funil"
                type="number"
                step="0.1"
                value={formData.peso_areia_funil || ''}
                onChange={(e) => handleGlobalDataChange('peso_areia_funil', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 1200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Proctor */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Dados do Proctor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="densidade_seca_max">Densidade Seca Máx. (g/cm³)</Label>
              <Input
                id="densidade_seca_max"
                type="number"
                step="0.001"
                value={formData.dados_proctor.densidade_seca_max || ''}
                onChange={(e) => handleProctorChange('densidade_seca_max', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 2.150"
              />
            </div>
            <div>
              <Label htmlFor="umidade_otima">Umidade Ótima (%)</Label>
              <Input
                id="umidade_otima"
                type="number"
                step="0.01"
                value={formData.dados_proctor.umidade_otima || ''}
                onChange={(e) => handleProctorChange('umidade_otima', e.target.value ? parseFloat(e.target.value) : null)}
                disabled={!isEditable}
                placeholder="Ex: 12.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}