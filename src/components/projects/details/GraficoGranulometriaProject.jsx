/**
 * GraficoGranulometriaProject.jsx
 * Gráfico Recharts de granulometria do projeto em escala logarítmica.
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PENEIRAS_CONFIG } from "@/constants/sieves";

export default function GraficoGranulometriaProject({ project, faixaEspecificacao }) {
  const peneirasComDados = PENEIRAS_CONFIG.filter(p => {
    return project.faixa_trabalho?.[p.key] !== undefined ||
      project.faixa_trabalho_min?.[p.key] !== undefined ||
      project.faixa_trabalho_max?.[p.key] !== undefined;
  });

  if (!peneirasComDados.length) return null;

  const data = peneirasComDados.map(p => {
    const abertura = parseFloat(p.abertura.replace(',', '.'));
    const entry = { abertura, label: p.label };
    if (project.faixa_trabalho?.[p.key] !== undefined) entry.mistura = project.faixa_trabalho[p.key];
    if (project.faixa_trabalho_min?.[p.key] !== undefined) entry.min = project.faixa_trabalho_min[p.key];
    if (project.faixa_trabalho_max?.[p.key] !== undefined) entry.max = project.faixa_trabalho_max[p.key];

    if (faixaEspecificacao?.peneiras) {
      const pEsp = faixaEspecificacao.peneiras.find(pe => {
        const abEsp = parseFloat(pe.abertura?.toString().replace(/mm/gi, '').replace(',', '.').trim());
        return Math.abs(abEsp - abertura) < 0.001;
      });
      if (pEsp) {
        if (pEsp.min !== undefined) entry.espMin = pEsp.min;
        if (pEsp.max !== undefined) entry.espMax = pEsp.max;
      }
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00233B20" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {data.some(d => d.espMin !== undefined) && (
          <Line type="monotone" dataKey="espMin" name="Esp. Mín" stroke="#94a3b8" strokeDasharray="4 2" dot={false} />
        )}
        {data.some(d => d.espMax !== undefined) && (
          <Line type="monotone" dataKey="espMax" name="Esp. Máx" stroke="#94a3b8" strokeDasharray="4 2" dot={false} />
        )}
        {data.some(d => d.min !== undefined) && (
          <Line type="monotone" dataKey="min" name="Mín Trabalho" stroke="#BFCF99" strokeWidth={1.5} dot={false} />
        )}
        {data.some(d => d.max !== undefined) && (
          <Line type="monotone" dataKey="max" name="Máx Trabalho" stroke="#BFCF99" strokeWidth={1.5} dot={false} />
        )}
        {data.some(d => d.mistura !== undefined) && (
          <Line type="monotone" dataKey="mistura" name="Mistura" stroke="#00233B" strokeWidth={2.5} dot={{ r: 3 }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}