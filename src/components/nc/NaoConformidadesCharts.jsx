import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, AlertTriangle, HardHat, MapPin, Building2, Calendar as CalendarIcon } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import EmptyChart from "./EmptyChart";

const tooltipStyle = { backgroundColor: 'rgba(242,241,239,0.97)', borderRadius: '8px', border: '1px solid rgba(0,35,59,0.15)' };
const legendFmt = (v) => <span style={{ color: '#00233B', fontSize: 12 }}>{v}</span>;
const smallLegendFmt = (v) => <span style={{ color: '#00233B', fontSize: 11 }}>{v}</span>;

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

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
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#00233B] text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#BFCF99]" />
            Evolução Temporal de NCs por Obra
            <span className="text-xs font-normal text-[#00233B]/50 ml-1">(top 6 obras)</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,35,59,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#00233B', fontSize: 11 }} tickLine={{ stroke: '#00233B' }} interval={hasDateFilter ? 0 : 4} />
                <YAxis
                  domain={[0, dadosTemporais.maxValue + 5]}
                  allowDecimals={false}
                  ticks={Array.from({ length: Math.ceil(dadosTemporais.maxValue + 5) + 1 }, (_, i) => i)}
                  tick={{ fill: '#00233B', fontSize: 11 }}
                  tickLine={{ stroke: '#00233B' }}
                  label={{ value: 'Nº de NCs', angle: -90, position: 'insideLeft', style: { fill: '#00233B', fontSize: 12 } }}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#00233B', fontWeight: 'bold', marginBottom: 4 }} />
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
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dadosStatusRNC} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onStatusClick} style={{ cursor: 'pointer' }}>
                  {dadosStatusRNC.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroStatus && filtroStatus !== e.statusKey ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={tooltipStyle} />
                <Legend formatter={legendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhum RNC para os filtros selecionados" />}
        </ChartCard>

        <ChartCard title="Parâmetros Não Conformes" icon={ClipboardList} subtitle="checklists • clique para filtrar">
          {dadosParametros.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dadosParametros} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onParametroClick} style={{ cursor: 'pointer' }}>
                  {dadosParametros.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroParametro && filtroParametro !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' ocorrência(s)', n]} contentStyle={tooltipStyle} />
                <Legend formatter={smallLegendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhuma NC de checklist para os filtros" />}
        </ChartCard>
      </div>

      {/* Row 2: Por Obra + Por Empreiteira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NCs por Obra" icon={AlertTriangle} subtitle="RNCs + Checklists • clique para filtrar">
          {dadosPorObra.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosPorObra} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onObraClick} style={{ cursor: 'pointer' }}>
                  {dadosPorObra.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroObraId && filtroObraId !== e.obraId ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                <Legend formatter={legendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhuma NC para os filtros selecionados" height={300} />}
        </ChartCard>

        <ChartCard title="NCs por Empreiteira" icon={HardHat} subtitle="obras de supervisão • clique para filtrar">
          {dadosPorEmpreiteira.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosPorEmpreiteira} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onEmpreiteiraClick} style={{ cursor: 'pointer' }}>
                  {dadosPorEmpreiteira.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroEmpreiteira && filtroEmpreiteira !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                <Legend formatter={legendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhuma NC por empreiteira para os filtros" height={300} />}
        </ChartCard>
      </div>

      {/* Row 3: Por Rodovia + Por Usina */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="NCs por Rodovia" icon={MapPin} subtitle="todos os tipos • clique para filtrar">
          {dadosPorRodovia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosPorRodovia} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onRodoviaClick} style={{ cursor: 'pointer' }}>
                  {dadosPorRodovia.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroRodovia && filtroRodovia !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                <Legend formatter={legendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhuma NC com rodovia para os filtros" height={300} />}
        </ChartCard>

        <ChartCard title="NCs por Usina" icon={Building2} subtitle="todos os tipos • clique para filtrar">
          {dadosPorUsina.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosPorUsina} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={onUsinaClick} style={{ cursor: 'pointer' }}>
                  {dadosPorUsina.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroUsina && filtroUsina !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                <Legend formatter={legendFmt} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Nenhuma NC com usina para os filtros" height={300} />}
        </ChartCard>
      </div>
    </>
  );
}