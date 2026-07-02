import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { DIMENSOES_CP, IDADES_CP } from '@/utils/ensaioRompimentoConcretoUtils';

const LabeledFieldSm = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium mb-1">{label}</label>
    {React.cloneElement(children, { id })}
  </div>
);

export default function EnsaioRompimentoConcretoResultados({
  series, seriesFlexao, formData,
  onAddSerie, onRemoveSerie, onUpdateSerie, onUpdateSerieCP,
  onAddSerieFlexao, onRemoveSerieFlexao, onUpdateSerieFlexao, onUpdateSerieFlexaoCP,
  onFieldChange,
}) {
  return (
    <div className="space-y-6">
      {/* Compressão Axial */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="">Resistência à Compressão Axial</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{series.length}/4 séries</span>
              <Button onClick={onAddSerie} size="sm" disabled={series.length >= 4} className="disabled:opacity-50">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Série
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {series.map((serie, serieIdx) => (
              <div key={serieIdx} className="border border-border rounded-lg p-4 bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold ">Série {serieIdx + 1}</h4>
                  <Button onClick={() => onRemoveSerie(serieIdx)} variant="destructive" size="sm" className="h-7 px-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-muted/20 rounded-lg border border-border">
                  <LabeledFieldSm id={`serie-${serieIdx}-idade`} label="Idade (dias)">
                    <select value={serie.idade} onChange={(e) => onUpdateSerie(serieIdx, 'idade', e.target.value)} className="w-full px-2 py-1 border border-border rounded bg-input  text-sm h-8">
                      <option value="">Selecionar...</option>
                      {IDADES_CP.map(d => <option key={d} value={d}>{d} dias</option>)}
                    </select>
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`serie-${serieIdx}-dimensao`} label="Dimensão">
                    <select value={serie.dimensao} onChange={(e) => onUpdateSerie(serieIdx, 'dimensao', e.target.value)} className="w-full px-2 py-1 border border-border rounded bg-input  text-sm h-8">
                      {DIMENSOES_CP.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`serie-${serieIdx}-data_ruptura`} label="Data Ruptura">
                    <Input value={serie.data_ruptura} readOnly className="bg-input border-border  h-8 text-sm opacity-70 cursor-not-allowed" title="Calculada automaticamente pela idade + data do ensaio" />
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`serie-${serieIdx}-area_cp`} label="Área CP (cm²)">
                    <Input value={serie.area_cp} readOnly className="bg-input border-border  h-8 text-sm opacity-70 cursor-not-allowed" title="Calculada automaticamente pela dimensão" />
                  </LabeledFieldSm>
                </div>
                <div className="space-y-3">
                  {serie.cps.map((cp, cpIdx) => (
                    <div key={cpIdx} className="border border-border rounded p-3 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">CP {cpIdx + 1}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <LabeledFieldSm id={`s${serieIdx}-cp${cpIdx}-numero_cp`} label="Número CP">
                          <Input value={cp.numero_cp} onChange={(e) => onUpdateSerieCP(serieIdx, cpIdx, 'numero_cp', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                        </LabeledFieldSm>
                        <LabeledFieldSm id={`s${serieIdx}-cp${cpIdx}-carga_ruptura`} label="Carga Ruptura (tf)">
                          <Input type="number" step="0.01" value={cp.carga_ruptura} onChange={(e) => onUpdateSerieCP(serieIdx, cpIdx, 'carga_ruptura', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                        </LabeledFieldSm>
                        <LabeledFieldSm id={`s${serieIdx}-cp${cpIdx}-resistencia`} label="Resistência (MPa)">
                          <Input value={cp.resistencia} readOnly className="bg-input border-border  h-8 text-sm opacity-70 cursor-not-allowed" title="Calculada automaticamente" />
                        </LabeledFieldSm>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {series.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma série adicionada. Clique em "Adicionar Série" para começar.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tração na Flexão */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="">Resistência à Tração na Flexão</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{seriesFlexao.length}/2 séries</span>
              <Button onClick={onAddSerieFlexao} size="sm" disabled={seriesFlexao.length >= 2} className="disabled:opacity-50">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Série
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {seriesFlexao.map((serie, serieIdx) => (
              <div key={serieIdx} className="border border-border rounded-lg p-4 bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold ">Série {serieIdx + 1}</h4>
                  <Button onClick={() => onRemoveSerieFlexao(serieIdx)} variant="destructive" size="sm" className="h-7 px-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-3 bg-muted/20 rounded-lg border border-border">
                  <LabeledFieldSm id={`fx-${serieIdx}-idade`} label="Idade (dias)">
                    <select value={serie.idade} onChange={(e) => onUpdateSerieFlexao(serieIdx, 'idade', e.target.value)} className="w-full px-2 py-1 border border-border rounded bg-input  text-sm h-8">
                      <option value="">Selecionar...</option>
                      {IDADES_CP.map(d => <option key={d} value={d}>{d} dias</option>)}
                    </select>
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`fx-${serieIdx}-data_ruptura`} label="Data Ruptura">
                    <Input value={serie.data_ruptura} readOnly className="bg-input border-border  h-8 text-sm opacity-70 cursor-not-allowed" title="Calculada automaticamente" />
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`fx-${serieIdx}-vao_central`} label="Vão Central (mm)">
                    <Input type="number" step="0.01" value={serie.vao_central} onChange={(e) => onUpdateSerieFlexao(serieIdx, 'vao_central', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`fx-${serieIdx}-altura_cp`} label="Altura CP (mm)">
                    <Input type="number" step="0.01" value={serie.altura_cp} onChange={(e) => onUpdateSerieFlexao(serieIdx, 'altura_cp', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                  </LabeledFieldSm>
                  <LabeledFieldSm id={`fx-${serieIdx}-largura_cp`} label="Largura CP (mm)">
                    <Input type="number" step="0.01" value={serie.largura_cp} onChange={(e) => onUpdateSerieFlexao(serieIdx, 'largura_cp', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                  </LabeledFieldSm>
                </div>
                <div className="space-y-3">
                  {serie.cps.map((cp, cpIdx) => (
                    <div key={cpIdx} className="border border-border rounded p-3 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">CP {cpIdx + 1}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <LabeledFieldSm id={`fx-s${serieIdx}-cp${cpIdx}-numero_cp`} label="Número CP">
                          <Input value={cp.numero_cp} onChange={(e) => onUpdateSerieFlexaoCP(serieIdx, cpIdx, 'numero_cp', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                        </LabeledFieldSm>
                        <LabeledFieldSm id={`fx-s${serieIdx}-cp${cpIdx}-ponto_ruptura`} label="Ponto de Ruptura">
                          <select value={cp.ponto_ruptura || ''} onChange={(e) => onUpdateSerieFlexaoCP(serieIdx, cpIdx, 'ponto_ruptura', e.target.value)} className="w-full px-2 py-1 border border-border rounded bg-input  text-sm h-8">
                            <option value="">Selecionar...</option>
                            <option value="No terço médio">No terço médio</option>
                            <option value="Fora do terço médio">Fora do terço médio</option>
                          </select>
                        </LabeledFieldSm>
                        <LabeledFieldSm id={`fx-s${serieIdx}-cp${cpIdx}-carga_ruptura`} label="Carga Ruptura (kgf)">
                          <Input type="number" step="0.01" value={cp.carga_ruptura} onChange={(e) => onUpdateSerieFlexaoCP(serieIdx, cpIdx, 'carga_ruptura', e.target.value)} className="bg-input border-border  h-8 text-sm" />
                        </LabeledFieldSm>
                        <LabeledFieldSm id={`fx-s${serieIdx}-cp${cpIdx}-resistencia`} label="Resistência (MPa)">
                          <Input value={cp.resistencia || ''} readOnly className="bg-input border-border  h-8 text-sm opacity-70 cursor-not-allowed" title="Calculada automaticamente" />
                        </LabeledFieldSm>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {seriesFlexao.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma série adicionada. Clique em "Adicionar Série" para começar.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="">Observações</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <label htmlFor="observacoes" className="sr-only">Observações gerais</label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => onFieldChange('observacoes', e.target.value)}
            placeholder="Observações gerais"
            className="bg-input border-border  h-24"
          />
        </CardContent>
      </Card>
    </div>
  );
}