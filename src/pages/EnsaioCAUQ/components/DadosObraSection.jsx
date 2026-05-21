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
    <Card className="bg-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Dados da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Obra + Projeto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="obra_id">Obra *</Label>
            <select id="obra_id" value={formData.obra_id}
              onChange={(e) => onObra(e.target.value)}
              required disabled={!canEdit || !!editingEnsaio?.id}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Selecione a obra</option>
              {obras.map(obra => {
                const regional = regionais.find(r => r.id === obra.regional_id);
                return (
                  <option key={obra.id} value={obra.id}>
                    {obra.name} - {obra.code}{regional ? ` (${regional.nome})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <Label htmlFor="project_id">Projeto CAUQ</Label>
            <select id="project_id" value={formData.project_id}
              onChange={(e) => onProject(e.target.value)}
              disabled={!canEdit || !formData.obra_id}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="">Selecione um projeto</option>
              {projetosCAUQ.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info regional */}
        {regionalSelecionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm space-y-0.5">
            <p className="text-blue-800"><strong>📍 Regional:</strong> {regionalSelecionada.nome}</p>
            {regionalSelecionada.cliente && (
              <p className="text-blue-800"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>
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
            <Input id="horario" type="time" value={formData.horario}
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
              <select id="rodovia" value={formData.rodovia}
                onChange={(e) => onChange('rodovia', e.target.value)}
                disabled={!canEdit}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">Selecione a rodovia</option>
                {rodoviasDisponiveis.map((r, i) => <option key={i} value={r}>{r}</option>)}
              </select>
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
            <Input id="local_coleta" value={formData.local_coleta}
              onChange={(e) => onChange('local_coleta', e.target.value)} disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="usina_fornecedora">Usina Fornecedora</Label>
            {usinasDisponiveis.length > 0 ? (
              <select id="usina_fornecedora" value={formData.usina_fornecedora}
                onChange={(e) => onChange('usina_fornecedora', e.target.value)}
                disabled={!canEdit}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">Selecione a usina</option>
                {usinasDisponiveis.map((u, i) => <option key={i} value={u}>{u}</option>)}
              </select>
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
              className={selectedProject ? "bg-slate-100" : ""} />
          </div>
        </div>

        {/* Ligante + Temp CAP + Realizado por */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="tipo_ligante">Tipo de Ligante</Label>
            <Input id="tipo_ligante" value={formData.tipo_ligante}
              onChange={(e) => onChange('tipo_ligante', e.target.value)}
              disabled={!canEdit} readOnly={!!selectedProject}
              className={selectedProject ? "bg-slate-100" : ""} />
          </div>
          <div>
            <Label htmlFor="temperatura_cap">Temperatura CAP (°C)</Label>
            <Input id="temperatura_cap" type="number"
              value={formData.temperatura_cap || ''}
              onChange={(e) => onChange('temperatura_cap', e.target.value ? parseFloat(e.target.value) : null)}
              disabled={!canEdit} />
          </div>
          <div>
            <Label htmlFor="ensaio_realizado_por">Ensaio realizado por</Label>
            <select id="ensaio_realizado_por" value={formData.ensaio_realizado_por}
              onChange={(e) => onChange('ensaio_realizado_por', e.target.value)}
              disabled={!canEdit}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="Afirma Evias">Afirma Evias</option>
              <option value="Empreiteira">Empreiteira</option>
            </select>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}