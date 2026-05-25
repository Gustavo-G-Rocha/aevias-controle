import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2, FileText, ClipboardList, X, Filter, HardHat, MapPin, Building2, Eye, Search, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { createPageUrl } from "@/utils";

import { useNaoConformidadesData } from "@/hooks/useNaoConformidadesData";
import { useNaoConformidadesFilters } from "@/hooks/useNaoConformidadesFilters";
import { useNaoConformidadesChartData } from "@/hooks/useNaoConformidadesChartData";
import {
  TIPOS_CHECKLIST, OUTROS_TIPOS_REGISTRO, RNC_PAGE,
  STATUS_LABELS,
} from "@/utils/naoConformidadesUtils";

// ---- Small reusable UI components (unchanged) ----
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

const PizzaCard = ({ title, icon: Icon, subtitle, children }) => (
  <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
    <CardHeader className="pb-2">
      <CardTitle className="text-[#00233B] text-base flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#BFCF99]" />
        {title}
        {subtitle && <span className="text-xs font-normal text-[#00233B]/50 ml-1">({subtitle})</span>}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const EmptyChart = ({ text, height = 280 }) => (
  <div className={`flex flex-col items-center justify-center text-[#00233B]/50`} style={{ height }}>
    <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
    <p className="text-sm text-center px-4">{text}</p>
  </div>
);

const tooltipStyle = { backgroundColor: 'rgba(242,241,239,0.97)', borderRadius: '8px', border: '1px solid rgba(0,35,59,0.15)' };
const legendFmt = (v) => <span style={{ color: '#00233B', fontSize: 12 }}>{v}</span>;
const smallLegendFmt = (v) => <span style={{ color: '#00233B', fontSize: 11 }}>{v}</span>;

// ---- Main Page ----
export default function NaoConformidadesPage() {
  const { loading, obras, rncs, checklistNCs } = useNaoConformidadesData();

  const {
    filtroStatus, setFiltroStatus,
    filtroParametro, setFiltroParametro,
    filtroObraId, setFiltroObraId,
    filtroEmpreiteira, setFiltroEmpreiteira,
    filtroRodovia, setFiltroRodovia,
    filtroUsina, setFiltroUsina,
    filtroDataInicial, setFiltroDataInicial,
    filtroDataFinal, setFiltroDataFinal,
    f, hasActiveFilter, clearFilters,
    opcoesEmpreiteira, opcoesRodovia, opcoesUsina,
    rncsVisiveis, cncsVisiveis,
  } = useNaoConformidadesFilters(obras, rncs, checklistNCs);

  const {
    dadosStatusRNC, dadosParametros, dadosPorObra,
    dadosPorEmpreiteira, dadosPorRodovia, dadosPorUsina,
    dadosTemporais, tabelaResumo,
  } = useNaoConformidadesChartData(obras, rncs, checklistNCs, f);

  const [tabelaBusca, setTabelaBusca] = useState('');
  const [tabelaTipo, setTabelaTipo] = useState('_all');
  const [tabelaPage, setTabelaPage] = useState(1);
  const tabelaItemsPerPage = 20;

  // ---- Chart click handlers ----
  const handleStatusClick = useCallback((d) => setFiltroStatus(p => p === d.statusKey ? null : d.statusKey), [setFiltroStatus]);
  const handleParametroClick = useCallback((d) => setFiltroParametro(p => p === d.name ? null : d.name), [setFiltroParametro]);
  const handleObraClick = useCallback((d) => setFiltroObraId(p => p === d.obraId ? null : d.obraId), [setFiltroObraId]);
  const handleEmpreiteiraClick = useCallback((d) => setFiltroEmpreiteira(p => p === d.name ? null : d.name), [setFiltroEmpreiteira]);
  const handleRodoviaClick = useCallback((d) => setFiltroRodovia(p => p === d.name ? null : d.name), [setFiltroRodovia]);
  const handleUsinaClick = useCallback((d) => setFiltroUsina(p => p === d.name ? null : d.name), [setFiltroUsina]);

  const tiposDisponiveis = useMemo(() => {
    const s = new Set([...rncsVisiveis.map(() => 'Relatório NC'), ...cncsVisiveis.map(nc => {
      const t = [...TIPOS_CHECKLIST, ...OUTROS_TIPOS_REGISTRO].find(t => t.value === nc.tipo);
      return t?.label || nc.tipo;
    })]);
    return [...s].sort();
  }, [rncsVisiveis, cncsVisiveis]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-[#00233B]">Dashboard de Não Conformidades</h1>
              <p className="text-[#00233B]/70 text-sm mt-1">Visão geral de todas as obras</p>
            </div>
          </div>
          {hasActiveFilter && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-[#00233B] border-white/30 hover:bg-white/20 gap-2">
              <X className="w-4 h-4" /> Limpar Filtros
            </Button>
          )}
        </div>

        {/* Filter dropdowns */}
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#00233B] text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#BFCF99]" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <span className="text-xs text-[#00233B]/70 font-medium mb-1 block flex items-center gap-1"><HardHat className="w-3 h-3" /> Empreiteira</span>
                <Select value={filtroEmpreiteira || '_all'} onValueChange={v => setFiltroEmpreiteira(v === '_all' ? null : v)}>
                  <SelectTrigger className="bg-white/50 border-white/30 text-[#00233B] h-9 text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todas</SelectItem>
                    {opcoesEmpreiteira.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-[#00233B]/70 font-medium mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Rodovia</span>
                <Select value={filtroRodovia || '_all'} onValueChange={v => setFiltroRodovia(v === '_all' ? null : v)}>
                  <SelectTrigger className="bg-white/50 border-white/30 text-[#00233B] h-9 text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todas</SelectItem>
                    {opcoesRodovia.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-[#00233B]/70 font-medium mb-1 block flex items-center gap-1"><Building2 className="w-3 h-3" /> Usina</span>
                <Select value={filtroUsina || '_all'} onValueChange={v => setFiltroUsina(v === '_all' ? null : v)}>
                  <SelectTrigger className="bg-white/50 border-white/30 text-[#00233B] h-9 text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todas</SelectItem>
                    {opcoesUsina.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs text-[#00233B]/70 font-medium mb-1 block flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Data Inicial</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full h-9 px-3 text-sm bg-white/50 border border-white/30 rounded-md text-[#00233B] text-left flex items-center justify-between hover:bg-white/60 transition-colors">
                      {filtroDataInicial ? format(filtroDataInicial, 'dd/MM/yyyy') : 'Selecionar'}
                      <CalendarIcon className="w-4 h-4 text-[#00233B]/50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar mode="single" selected={filtroDataInicial} onSelect={setFiltroDataInicial} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <span className="text-xs text-[#00233B]/70 font-medium mb-1 block flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Data Final</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full h-9 px-3 text-sm bg-white/50 border border-white/30 rounded-md text-[#00233B] text-left flex items-center justify-between hover:bg-white/60 transition-colors">
                      {filtroDataFinal ? format(filtroDataFinal, 'dd/MM/yyyy') : 'Selecionar'}
                      <CalendarIcon className="w-4 h-4 text-[#00233B]/50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar mode="single" selected={filtroDataFinal} onSelect={setFiltroDataFinal} disabled={(date) => filtroDataInicial ? date < filtroDataInicial : false} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active filter badges */}
        {hasActiveFilter && (
          <div className="flex flex-wrap gap-2">
            {filtroStatus && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroStatus(null)}>Status: {STATUS_LABELS[filtroStatus]} <X className="w-3 h-3"/></Badge>}
            {filtroParametro && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroParametro(null)}>Parâmetro: {filtroParametro} <X className="w-3 h-3"/></Badge>}
            {filtroObraId && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroObraId(null)}>Obra: {obras.find(o => o.id === filtroObraId)?.name} <X className="w-3 h-3"/></Badge>}
            {filtroEmpreiteira && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroEmpreiteira(null)}>Empreiteira: {filtroEmpreiteira} <X className="w-3 h-3"/></Badge>}
            {filtroRodovia && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroRodovia(null)}>Rodovia: {filtroRodovia} <X className="w-3 h-3"/></Badge>}
            {filtroUsina && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroUsina(null)}>Usina: {filtroUsina} <X className="w-3 h-3"/></Badge>}
            {filtroDataInicial && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroDataInicial(null)}>De: {format(filtroDataInicial, 'dd/MM/yyyy')} <X className="w-3 h-3"/></Badge>}
            {filtroDataFinal && <Badge className="bg-[#BFCF99]/30 text-[#00233B] border border-[#BFCF99]/50 cursor-pointer gap-1" onClick={() => setFiltroDataFinal(null)}>Até: {format(filtroDataFinal, 'dd/MM/yyyy')} <X className="w-3 h-3"/></Badge>}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de RNCs", value: rncsVisiveis.length, color: "text-[#00233B]" },
            { label: "RNCs Abertas", value: rncsVisiveis.filter(r => r.status === 'aberta').length, color: "text-red-600" },
            { label: "Em Tratativa", value: rncsVisiveis.filter(r => r.status === 'em_tratativa').length, color: "text-amber-600" },
            { label: "NCs em Registros", value: cncsVisiveis.length, color: "text-blue-600" },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-white/20 backdrop-blur-lg border border-white/20">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-[#00233B]/70 font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline Chart */}
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
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#00233B', fontSize: 11 }}
                    tickLine={{ stroke: '#00233B' }}
                    interval={(f.dataInicial || f.dataFinal) ? 0 : 4}
                  />
                  <YAxis
                    domain={[0, dadosTemporais.maxValue + 5]}
                    allowDecimals={false}
                    ticks={Array.from({ length: Math.ceil(dadosTemporais.maxValue + 5) + 1 }, (_, i) => i)}
                    tick={{ fill: '#00233B', fontSize: 11 }}
                    tickLine={{ stroke: '#00233B' }}
                    label={{ value: 'Nº de NCs', angle: -90, position: 'insideLeft', style: { fill: '#00233B', fontSize: 12 } }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#00233B', fontWeight: 'bold', marginBottom: 4 }}
                  />
                  <Legend formatter={legendFmt} />
                  {Object.keys(dadosTemporais.data[0] || {}).filter(k => k !== 'date').map((obraNome, i) => (
                    <Area
                      key={obraNome}
                      type="monotone"
                      dataKey={obraNome}
                      stroke="none"
                      fillOpacity={0.7}
                      fill={`url(#color${i})`}
                    />
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
          <PizzaCard title="Status dos RNCs" icon={FileText} subtitle="clique para filtrar">
            {dadosStatusRNC.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dadosStatusRNC} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleStatusClick} style={{ cursor: 'pointer' }}>
                    {dadosStatusRNC.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroStatus && filtroStatus !== e.statusKey ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={tooltipStyle} />
                  <Legend formatter={legendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhum RNC para os filtros selecionados" />}
          </PizzaCard>

          <PizzaCard title="Parâmetros Não Conformes" icon={ClipboardList} subtitle="checklists • clique para filtrar">
            {dadosParametros.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={dadosParametros} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleParametroClick} style={{ cursor: 'pointer' }}>
                    {dadosParametros.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroParametro && filtroParametro !== e.name ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' ocorrência(s)', n]} contentStyle={tooltipStyle} />
                  <Legend formatter={smallLegendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhuma NC de checklist para os filtros" />}
          </PizzaCard>
        </div>

        {/* Row 2: Por Obra + Por Empreiteira */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PizzaCard title="NCs por Obra" icon={AlertTriangle} subtitle="RNCs + Checklists • clique para filtrar">
            {dadosPorObra.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosPorObra} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleObraClick} style={{ cursor: 'pointer' }}>
                    {dadosPorObra.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroObraId && filtroObraId !== e.obraId ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                  <Legend formatter={legendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhuma NC para os filtros selecionados" height={300} />}
          </PizzaCard>

          <PizzaCard title="NCs por Empreiteira" icon={HardHat} subtitle="obras de supervisão • clique para filtrar">
            {dadosPorEmpreiteira.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosPorEmpreiteira} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleEmpreiteiraClick} style={{ cursor: 'pointer' }}>
                    {dadosPorEmpreiteira.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroEmpreiteira && filtroEmpreiteira !== e.name ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                  <Legend formatter={legendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhuma NC por empreiteira para os filtros" height={300} />}
          </PizzaCard>
        </div>

        {/* Row 3: Por Rodovia + Por Usina */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PizzaCard title="NCs por Rodovia" icon={MapPin} subtitle="todos os tipos • clique para filtrar">
            {dadosPorRodovia.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosPorRodovia} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleRodoviaClick} style={{ cursor: 'pointer' }}>
                    {dadosPorRodovia.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroRodovia && filtroRodovia !== e.name ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                  <Legend formatter={legendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhuma NC com rodovia para os filtros" height={300} />}
          </PizzaCard>

          <PizzaCard title="NCs por Usina" icon={Building2} subtitle="todos os tipos • clique para filtrar">
            {dadosPorUsina.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={dadosPorUsina} cx="50%" cy="50%" innerRadius={65} outerRadius={110} dataKey="value" labelLine={false} label={<CustomLabel />} onClick={handleUsinaClick} style={{ cursor: 'pointer' }}>
                    {dadosPorUsina.map((e, i) => <Cell key={i} fill={e.color} opacity={filtroUsina && filtroUsina !== e.name ? 0.3 : 1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' NC(s)', n]} contentStyle={tooltipStyle} />
                  <Legend formatter={legendFmt} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart text="Nenhuma NC com usina para os filtros" height={300} />}
          </PizzaCard>
        </div>

        {/* Tabela unificada de ocorrências */}
        {(() => {
          const rncRows = rncsVisiveis.map(r => ({
            _kind: 'rnc',
            id: r.id,
            tipo: 'RNC',
            tipoLabel: 'Relatório NC',
            criador: r.relatorio_criador || r.fiscal || '',
            data: r.data_nc || '',
            parametro: r.parametro_nc || r.categoria_nc || '',
            rodovia: r.rodovia || '',
            usina: '',
            empreiteira: r.executora || '',
            page: RNC_PAGE,
          }));
          const checklistRows = cncsVisiveis.map(nc => {
            const t = [...TIPOS_CHECKLIST, ...OUTROS_TIPOS_REGISTRO].find(t => t.value === nc.tipo);
            return {
              _kind: 'checklist',
              id: nc.id,
              tipo: nc.tipo,
              tipoLabel: t?.label || nc.tipo,
              criador: nc.laboratorista_name || '',
              data: nc.data || '',
              parametro: nc.parametro || '',
              rodovia: nc.rodovia || '',
              usina: nc.usina || '',
              empreiteira: nc.empreiteira || '',
              page: nc._page || t?.page || '',
            };
          });

          const busca = tabelaBusca.toLowerCase().trim();
          let allRows = [...rncRows, ...checklistRows];
          if (tabelaTipo !== '_all') allRows = allRows.filter(r => r.tipoLabel === tabelaTipo);
          if (busca) allRows = allRows.filter(r =>
            r.tipoLabel.toLowerCase().includes(busca) ||
            r.criador.toLowerCase().includes(busca) ||
            r.parametro.toLowerCase().includes(busca) ||
            r.rodovia.toLowerCase().includes(busca) ||
            r.usina.toLowerCase().includes(busca) ||
            r.empreiteira.toLowerCase().includes(busca)
          );
          const total = allRows.length;
          const totalPages = Math.ceil(total / tabelaItemsPerPage);
          const startIndex = (tabelaPage - 1) * tabelaItemsPerPage;
          const displayRows = allRows.slice(startIndex, startIndex + tabelaItemsPerPage);

          return (
            <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-[#00233B] text-base flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#BFCF99]" />
                  Ocorrências Detalhadas
                  {total > 0 && <Badge className="bg-[#BFCF99]/40 text-[#00233B] text-xs ml-2">{total}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00233B]/40" />
                    <Input
                      value={tabelaBusca}
                      onChange={e => setTabelaBusca(e.target.value)}
                      placeholder="Buscar por criador, parâmetro, rodovia, usina..."
                      className="pl-8 h-9 text-sm bg-white/50 border-white/30 text-[#00233B] placeholder:text-[#00233B]/40"
                    />
                  </div>
                  <Select value={tabelaTipo} onValueChange={setTabelaTipo}>
                    <SelectTrigger className="bg-white/50 border-white/30 text-[#00233B] h-9 text-sm w-full sm:w-52">
                      <SelectValue placeholder="Tipo de registro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">Todos os tipos</SelectItem>
                      {tiposDisponiveis.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {(tabelaBusca || tabelaTipo !== '_all') && (
                    <Button size="sm" variant="ghost" onClick={() => { setTabelaBusca(''); setTabelaTipo('_all'); setTabelaPage(1); }} className="h-9 px-3 text-[#00233B]/60 hover:text-[#00233B] gap-1 whitespace-nowrap">
                      <X className="w-3.5 h-3.5" /> Limpar
                    </Button>
                  )}
                </div>
                {displayRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          {["Tipo de Registro","Criado por","Data","Parâmetro / NC","Rodovia","Usina","Empreiteira",""].map(h => (
                            <th key={h} className="text-left py-2 px-3 text-[#00233B] font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayRows.map((row, i) => (
                          <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                            <td className="py-2 px-3 whitespace-nowrap">
                              <Badge className={row._kind === 'rnc' ? "bg-red-100 text-red-800 font-normal" : "bg-blue-100 text-blue-800 font-normal"}>
                                {row.tipoLabel}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-[#00233B]/80 whitespace-nowrap">{row.criador || '—'}</td>
                            <td className="py-2 px-3 text-[#00233B]/80 whitespace-nowrap">
                              {(() => {
                                if (!row.data) return '—';
                                try {
                                  const date = new Date(row.data + 'T12:00:00');
                                  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
                                } catch {
                                  return '—';
                                }
                              })()}
                            </td>
                            <td className="py-2 px-3 text-[#00233B] max-w-[180px] truncate">{row.parametro || '—'}</td>
                            <td className="py-2 px-3 text-[#00233B]/70 whitespace-nowrap">{row.rodovia || '—'}</td>
                            <td className="py-2 px-3 text-[#00233B]/70 whitespace-nowrap">{row.usina || '—'}</td>
                            <td className="py-2 px-3 text-[#00233B]/70 whitespace-nowrap">{row.empreiteira || '—'}</td>
                            <td className="py-2 px-3">
                              {row.page && row.id && (
                                <a href={createPageUrl(row.page) + `?id=${row.id}`} target="_blank" rel="noreferrer">
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[#00233B]/70 hover:text-[#00233B] gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span className="text-xs">Ver</span>
                                  </Button>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {total > tabelaItemsPerPage && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTabelaPage(p => Math.max(1, p - 1))}
                          disabled={tabelaPage === 1}
                          className="h-8 px-3 text-[#00233B] border-white/30 disabled:opacity-50"
                        >
                          Anterior
                        </Button>
                        <span className="text-xs text-[#00233B]/70">
                          Página {tabelaPage} de {totalPages} ({total} registros)
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTabelaPage(p => Math.min(totalPages, p + 1))}
                          disabled={tabelaPage === totalPages}
                          className="h-8 px-3 text-[#00233B] border-white/30 disabled:opacity-50"
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-[#00233B]/50">
                    <ClipboardList className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">Nenhuma ocorrência para os filtros selecionados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Tabela Resumo */}
        <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="text-[#00233B] text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#BFCF99]" />
              Tabela Resumo de NCs por Obra
              {hasActiveFilter && <Badge className="bg-[#BFCF99]/40 text-[#00233B] text-xs ml-2">{tabelaResumo.length} obra(s)</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tabelaResumo.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-2 px-3 text-[#00233B] font-semibold text-xs uppercase tracking-wide">Obra</th>
                      <th className="text-center py-2 px-3 text-[#00233B] font-semibold text-xs uppercase tracking-wide">Total RNC</th>
                      <th className="text-center py-2 px-3 text-red-600 font-semibold text-xs uppercase tracking-wide">Abertas</th>
                      <th className="text-center py-2 px-3 text-amber-600 font-semibold text-xs uppercase tracking-wide">Em Tratativa</th>
                      <th className="text-center py-2 px-3 text-green-600 font-semibold text-xs uppercase tracking-wide">Finalizadas</th>
                      <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Canceladas</th>
                      <th className="text-center py-2 px-3 text-blue-600 font-semibold text-xs uppercase tracking-wide">NCs Checklist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabelaResumo.map((row, i) => (
                      <tr key={i} className={`border-b border-white/10 transition-colors cursor-pointer ${filtroObraId === row.obra.id ? 'bg-[#BFCF99]/20' : 'hover:bg-white/10'}`} onClick={() => handleObraClick({ obraId: row.obra.id })}>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-[#00233B]">{row.obra.name}</p>
                          <p className="text-xs text-[#00233B]/60">{row.obra.code}</p>
                        </td>
                        <td className="text-center py-2.5 px-3 font-bold text-[#00233B]">{row.totalRnc}</td>
                        <td className="text-center py-2.5 px-3">{row.abertas > 0 ? <Badge className="bg-red-100 text-red-700">{row.abertas}</Badge> : <span className="text-[#00233B]/30">—</span>}</td>
                        <td className="text-center py-2.5 px-3">{row.emTratativa > 0 ? <Badge className="bg-amber-100 text-amber-700">{row.emTratativa}</Badge> : <span className="text-[#00233B]/30">—</span>}</td>
                        <td className="text-center py-2.5 px-3">{row.finalizadas > 0 ? <Badge className="bg-green-100 text-green-700">{row.finalizadas}</Badge> : <span className="text-[#00233B]/30">—</span>}</td>
                        <td className="text-center py-2.5 px-3">{row.canceladas > 0 ? <Badge className="bg-gray-100 text-gray-600">{row.canceladas}</Badge> : <span className="text-[#00233B]/30">—</span>}</td>
                        <td className="text-center py-2.5 px-3">{row.paramChecklist > 0 ? <Badge className="bg-blue-100 text-blue-700">{row.paramChecklist}</Badge> : <span className="text-[#00233B]/30">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#00233B]/50">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">{hasActiveFilter ? 'Nenhuma obra corresponde aos filtros selecionados' : 'Nenhuma não conformidade registrada'}</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}