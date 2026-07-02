import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Loader2 } from "lucide-react";
import { TIPOS_ENSAIO } from "../constants/camposPorTipo";

export default function FiltrosCard({
  obras, regionais,
  obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro, laboratoristas,
  loadingData, temDados,
  onObraChange, onTipoChange,
  onDataInicioChange, onDataFimChange, onLaboratoristaChange,
  onGerarResumo, onExportarCSV,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5 text-secondary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Obra */}
        <div>
          <Label htmlFor="obra" className="text-foreground">Obra *</Label>
          <select
            id="obra"
            value={obraId}
            onChange={(e) => onObraChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Selecione uma obra</option>
            {obras.map(obra => {
              const regional = regionais.find(r => r.id === obra.regional_id);
              return (
                <option key={obra.id} value={obra.id}>
                  {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Tipo de Ensaio */}
        <div>
          <Label htmlFor="tipoEnsaio" className="text-foreground">Tipo de Ensaio *</Label>
          <select
            id="tipoEnsaio"
            value={tipoEnsaioSelecionado}
            onChange={(e) => onTipoChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Selecione um tipo de ensaio</option>
            {TIPOS_ENSAIO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio" className="text-foreground">Data Início</Label>
            <Input
              id="dataInicio" type="date" value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-foreground">Data Fim</Label>
            <Input
              id="dataFim" type="date" value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
            />
          </div>
        </div>

        {/* Laboratorista */}
        {laboratoristas.length > 0 && (
          <div>
            <Label htmlFor="laboratorista" className="text-foreground">Laboratorista</Label>
            <select
              id="laboratorista"
              value={laboratoristaFiltro}
              onChange={(e) => onLaboratoristaChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Todos</option>
              {laboratoristas.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onGerarResumo}
            disabled={loadingData || !obraId || !tipoEnsaioSelecionado}
          >
            {loadingData ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Carregando...</>
            ) : 'Gerar Resumo'}
          </Button>
          {temDados && (
            <Button onClick={onExportarCSV} variant="outline">
              Exportar CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}