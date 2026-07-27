import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, AlertTriangle, HardHat, MapPin, Building2, Calendar as CalendarIcon } from "lucide-react";
import { Legend, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import EmptyChart from "./EmptyChart";
import PieWithLegend from "./PieWithLegend";

const AXIS = 'var(--color-text-muted)';
const tooltipStyle = { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: '8px', border: '1px solid var(--color-border)' };
const legendFmt = (v) => <span style={{ color: 'var(--color-text)', fontSize: 12 }}>{v}</span>;

const PIE_HEIGHT = 330;

export default function NaoConformidadesCharts({
  dadosStatusRNC, dadosParametros, dadosPorObra,
  dadosPorEmpreiteira, dadosPorRodovia, dadosPorUsina,
  dadosTemporais,
  filtroStatus, filtroParametro, filtroObraId,
  filtroEmpreiteira, filtroRodovia, filtroUsina,
  onStatusClick, onParametroClick, onObraClick,
  onEmpreiteiraClick, onRodoviaClick, onUsinaClick,
  hasDateFilter,
}) {
  return (
    <>
      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-secondary" />
            Evolução Temporal de NCs por Obra
            <span className="text-xs font-normal text-muted-foreground ml-1">(top 6 obras)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dadosTemporais.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={dadosTemporais.data}>
                <defs>
                  {Object.keys(dadosTemporais.data[0] || {}).filter(k => k !== 'date').map((obraNome, i) => (
                    <linearGradient key={obraNome} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={dadosTemporais.timelineColors[i % dadosTemporais.timelineColors.length]} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={dadosTemporais.timelineColors[i % dadosTemporais.timelineColors.length]} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 11 }} tickLine={{ stroke: AXIS }} interval={hasDateFilter ? 0 : 4} />
                <YAxis
                  domain={[0, dadosTemporais.maxValue + 5]}
                  allowDecimals={false}
                  ticks={Array.from({ length: Math.ceil(dadosTemporais.maxValue + 5) + 1 }, (_, i) => i)}
                  tick={{ fill: AXIS, fontSize: 11 }}
                  tickLine={{ stroke: AXIS }}
                  label={{ value: 'Nº de NCs', angle: -90, position: 'insideLeft', style: { fill: AXIS, fontSize: 12 } }}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-text)', fontWeight: 'bold', marginBottom: 4 }} />
                <Legend formatter={legendFmt} />
                {Object.keys(dadosTemporais.data[0] || {}).filter(k => k !== 'date').map((obraNome, i) => (
                  <Area key={obraNome} type="monotone" dataKey={obraNome} stroke="none" fillOpacity={0.7} fill={`url(#color${i})`} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="Nenhum dado temporal disponível para os filtros selecionados" height={350} />
          )}
        </CardContent>
      </Card>

      {/* Row 1: Status + Parâmetros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Status dos RNCs" icon={FileText} subtitle="clique para filtrar">
          {dadosStatusRNC.length > 0 ? (
            <PieWithLegend
              data={dadosStatusRNC}
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroStatus && filtroStatus !== e.statusKey}
              onItemClick={onStatusClick}
            />
          ) : <EmptyChart text="Nenhum RNC para os filtros selecionados" height={PIE_HEIGHT} />}
        </ChartCard>

        <ChartCard title="Parâmetros Não Conformes" icon={ClipboardList} subtitle="checklists • clique para filtrar">
          {dadosParametros.length > 0 ? (
            <PieWithLegend
              data={dadosParametros}
              valueSuffix=" ocorrência(s)"
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroParametro && filtroParametro !== e.name}
              onItemClick={onParametroClick}
            />
          ) : <EmptyChart text="Nenhuma NC de checklist para os filtros" height={PIE_HEIGHT} />}
        </ChartCard>
      </div>

      {/* Row 2: Por Obra + Por Empreiteira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NCs por Obra" icon={AlertTriangle} subtitle="RNCs + Checklists • clique para filtrar">
          {dadosPorObra.length > 0 ? (
            <PieWithLegend
              data={dadosPorObra}
              valueSuffix=" NC(s)"
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroObraId && filtroObraId !== e.obraId}
              onItemClick={onObraClick}
            />
          ) : <EmptyChart text="Nenhuma NC para os filtros selecionados" height={PIE_HEIGHT} />}
        </ChartCard>

        <ChartCard title="NCs por Empreiteira" icon={HardHat} subtitle="obras de supervisão • clique para filtrar">
          {dadosPorEmpreiteira.length > 0 ? (
            <PieWithLegend
              data={dadosPorEmpreiteira}
              valueSuffix=" NC(s)"
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroEmpreiteira && filtroEmpreiteira !== e.name}
              onItemClick={onEmpreiteiraClick}
            />
          ) : <EmptyChart text="Nenhuma NC por empreiteira para os filtros" height={PIE_HEIGHT} />}
        </ChartCard>
      </div>

      {/* Row 3: Por Rodovia + Por Usina */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NCs por Rodovia" icon={MapPin} subtitle="todos os tipos • clique para filtrar">
          {dadosPorRodovia.length > 0 ? (
            <PieWithLegend
              data={dadosPorRodovia}
              valueSuffix=" NC(s)"
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroRodovia && filtroRodovia !== e.name}
              onItemClick={onRodoviaClick}
            />
          ) : <EmptyChart text="Nenhuma NC com rodovia para os filtros" height={PIE_HEIGHT} />}
        </ChartCard>

        <ChartCard title="NCs por Usina" icon={Building2} subtitle="todos os tipos • clique para filtrar">
          {dadosPorUsina.length > 0 ? (
            <PieWithLegend
              data={dadosPorUsina}
              valueSuffix=" NC(s)"
              height={PIE_HEIGHT}
              isDimmed={(e) => filtroUsina && filtroUsina !== e.name}
              onItemClick={onUsinaClick}
            />
          ) : <EmptyChart text="Nenhuma NC com usina para os filtros" height={PIE_HEIGHT} />}
        </ChartCard>
      </div>
    </>
  );
}