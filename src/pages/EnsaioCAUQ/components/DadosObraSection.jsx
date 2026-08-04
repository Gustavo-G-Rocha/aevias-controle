/**
 * DadosObraSection.jsx
 *
 * Seção de dados da obra/projeto do Ensaio CAUQ:
 * seleção de obra, projeto, data, placa, rodovia, trecho,
 * local de coleta, usina, pedreira, faixa, ligante e
 * quem realizou o ensaio.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DadosObraSection({
  formData,
  obras,
  regionais,
  projetosCAUQ,
  obraSelecionada,
  regionalSelecionada,
  selectedProject,
  isEditable,
  isApproved,
  editingEnsaio,
  onObra,
  onProject,
  onChange,
}) {
  const canEdit = isEditable && !isApproved;
  const usinasDisponiveis = obraSelecionada?.usinas || [];
  const rodoviasDisponiveis = obraSelecionada?.rodovias || [];

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Obra + Projeto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <Select value={formData.obra_id || ""}
              onValueChange={onObra}
              disabled={!canEdit || !!editingEnsaio?.id}>
              <SelectTrigger id="obra_id" data-testid="obra_id">
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent title="Selecione a obra">
                {obras.map(obra => {
                  const regional = regionais.find(r => r.id === obra.regional_id);
                  return (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.name} - {obra.code}{regional ? ` (${regional.nome})` : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="project_id">Projeto CAUQ</Label>
            <Select value={formData.project_id || ""}
              onValueChange={onProject}
              disabled={!canEdit || !formData.obra_id}>
              <SelectTrigger id="project_id" data-testid="project_id">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent title="Projeto CAUQ">
                {projetosCAUQ.map(proj => (
                  <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info regional */}
        {regionalSelecionada && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-sm space-y-0.5">
            <p className="text-primary"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
            {regionalSelecionada.cliente && (
              <p className="text-primary"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
            )}
          </div>
        )}

        {/* Data, Horário, Placa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="data_ensaio">Data *</Label>
            <Input id="data_ensaio" type="date" value={formData.data_ensaio}
              onChange={(e) => onChange('data_ensaio', e.target.value)}
              required={formData.status === 'finalizado'} disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="horario">Horário</Label>
            <Input id="horario" type="time" data-testid="horario" value={formData.horario}
              onChange={(e) => onChange('horario', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="placa_caminhao">Placa Caminhão</Label>
            <Input id="placa_caminhao" value={formData.placa_caminhao}
              onChange={(e) => onChange('placa_caminhao', e.target.value)} disabled={!canEdit} />
          </div>
        </div>

        {/* Rodovia + Trecho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="rodovia">Rodovia</Label>
            {rodoviasDisponiveis.length > 0 ? (
              <Select value={formData.rodovia || ""}
                onValueChange={(value) => onChange('rodovia', value)}
                disabled={!canEdit}>
                <SelectTrigger id="rodovia">
                  <SelectValue placeholder="Selecione a rodovia" />
                </SelectTrigger>
                <SelectContent title="Selecione a rodovia">
                  {rodoviasDisponiveis.map((r, i) => <SelectItem key={i} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id="rodovia" value={formData.rodovia}
                onChange={(e) => onChange('rodovia', e.target.value)}
                disabled={!canEdit}
                placeholder={formData.obra_id ? "Nenhuma rodovia cadastrada" : "Selecione a obra primeiro"} />
            )}
          </div>
          <div>
            <Label htmlFor="trecho">Trecho</Label>
            <Input id="trecho" value={formData.trecho}
              onChange={(e) => onChange('trecho', e.target.value)} disabled={!canEdit} />
          </div>
        </div>

        {/* Local de coleta + Usina */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="local_coleta">Local de Coleta</Label>
            <Input id="local_coleta" data-testid="local_coleta" value={formData.local_coleta}
              onChange={(e) => onChange('local_coleta', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="usina_fornecedora">Usina Fornecedora</Label>
            {usinasDisponiveis.length > 0 ? (
              <Select value={formData.usina_fornecedora || ""}
                onValueChange={(value) => onChange('usina_fornecedora', value)}
                disabled={!canEdit}>
                <SelectTrigger id="usina_fornecedora">
                  <SelectValue placeholder="Selecione a usina" />
                </SelectTrigger>
                <SelectContent title="Usina Fornecedora">
                  {usinasDisponiveis.map((u, i) => <SelectItem key={i} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input id="usina_fornecedora" value={formData.usina_fornecedora}
                onChange={(e) => onChange('usina_fornecedora', e.target.value)}
                disabled={!canEdit}
                placeholder={formData.obra_id ? "Nenhuma usina cadastrada" : "Selecione a obra primeiro"} />
            )}
          </div>
        </div>

        {/* Pedreira + Faixa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pedreira">Pedreira</Label>
            <Input id="pedreira" value={formData.pedreira}
              onChange={(e) => onChange('pedreira', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="faixa_especificada">Faixa Especificada</Label>
            <Input id="faixa_especificada" value={formData.faixa_especificada}
              onChange={(e) => onChange('faixa_especificada', e.target.value)}
              disabled={!canEdit} readOnly={!!selectedProject}
              className={selectedProject ? "bg-muted" : ""} />
          </div>
        </div>

        {/* Ligante + Temp CAP + Realizado por */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="tipo_ligante">Tipo de Ligante</Label>
            <Input id="tipo_ligante" data-testid="tipo_ligante" value={formData.tipo_ligante}
              onChange={(e) => onChange('tipo_ligante', e.target.value)}
              disabled={!canEdit} readOnly={!!selectedProject}
              className={selectedProject ? "bg-muted" : ""} />
          </div>
          <div>
            <Label htmlFor="temperatura_cap">Temperatura CAP (°C)</Label>
            <Input id="temperatura_cap" type="number" data-testid="temperatura_cap"
              value={formData.temperatura_cap ?? ''}
              onChange={(e) => onChange('temperatura_cap', e.target.value === '' ? null : e.target.value)}
              disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="ensaio_realizado_por">Ensaio realizado por</Label>
            <Select value={formData.ensaio_realizado_por || ""}
              onValueChange={(value) => onChange('ensaio_realizado_por', value)}
              disabled={!canEdit}>
              <SelectTrigger id="ensaio_realizado_por">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent title="Ensaio realizado por">
                <SelectItem value="Afirma Evias">Afirma Evias</SelectItem>
                <SelectItem value="Empreiteira">Empreiteira</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}