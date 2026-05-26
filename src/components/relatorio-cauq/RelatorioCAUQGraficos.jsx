import React from 'react';
import { getXLog, getYGraph } from '@/utils/relatorioCAUQUtils';

/**
 * Gráfico SVG de granulometria (escala logarítmica) com tooltip interativo.
 */
export default function RelatorioCAUQGraficos({
  dadosGranulometria,
  realizarMarshall,
  hoveredPoint,
  tooltipPos,
  onPointHover,
  onPointLeave,
}) {
  if (dadosGranulometria.length === 0) return null;

  const alturaTotal   = realizarMarshall ? 190 : 390;
  const alturaGrafico = realizarMarshall ? 185 : 385;

  const aberturas   = dadosGranulometria.map(d => parseFloat(d.abertura.replace(',', '.')));
  const minAbertura = Math.min(...aberturas);
  const maxAbertura = Math.max(...aberturas);

  const getX = (aberturaMm) => getXLog(aberturaMm, minAbertura, maxAbertura);
  const getY = (pct)        => getYGraph(pct, alturaTotal, alturaGrafico);

  const yLabel   = realizarMarshall ? 205 : 405;
  const yLegenda = realizarMarshall ? 215 : 415;
  const viewBox  = realizarMarshall ? '0 0 640 250' : '0 0 640 450';

  return (
    <div className={`border border-slate-300 p-0 print:p-0 ${realizarMarshall ? 'mb-0' : 'mb-2'}`}>
      <h3 className={`font-bold text-center mb-0 print:py-0 ${realizarMarshall ? 'text-[7px] print:text-[6px]' : 'text-[10px] print:text-[9px] py-1'}`}>
        GRANULOMETRIA DA MISTURA
      </h3>

      <div className={`relative ${realizarMarshall ? 'h-48 print:h-48' : 'h-96 print:h-80'}`}>
        {hoveredPoint && (
          <div
            className="absolute bg-white border-2 border-slate-300 rounded-lg shadow-lg p-2 text-[8px] z-50 pointer-events-none"
            style={{
              left: `${tooltipPos.x + 10}px`,
              top: `${tooltipPos.y - 10}px`,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="font-bold text-slate-800 mb-1">{hoveredPoint.astm}</div>
            {hoveredPoint.faixaEspecMin  && <div className="text-red-600">Faixa Especificada: {hoveredPoint.faixaEspecMin}%</div>}
            {hoveredPoint.faixaEspecMax  && <div className="text-red-600">Faixa Especificada: {hoveredPoint.faixaEspecMax}%</div>}
            {hoveredPoint.faixaTrabalhoMin && <div className="text-amber-600">Faixa de Trabalho Mín: {hoveredPoint.faixaTrabalhoMin}%</div>}
            {hoveredPoint.faixaTrabalhoMax && <div className="text-amber-600">Faixa de Trabalho Máx: {hoveredPoint.faixaTrabalhoMax}%</div>}
            <div className="text-blue-600 font-semibold">% Passante (Ensaio): {hoveredPoint.percentualPassante}%</div>
          </div>
        )}

        <svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-label="Gráfico de Granulometria da Mistura" role="img">
          {/* Eixos */}
          <line x1="30" y1="5" x2="30" y2={alturaTotal} stroke="#333" strokeWidth="1" />
          <line x1="30" y1={alturaTotal} x2="620" y2={alturaTotal} stroke="#333" strokeWidth="1" />

          {/* Grid horizontal */}
          {[0, 20, 40, 60, 80, 100].map(value => {
            const y = getY(value);
            return (
              <g key={value}>
                <line x1="30" y1={y} x2="620" y2={y} stroke="#e0e0e0" strokeWidth="0.5" />
                <text x="25" y={y + 3} fontSize="8" textAnchor="end" fill="#333">{value}%</text>
              </g>
            );
          })}

          {/* Labels eixo X */}
          {dadosGranulometria.map((d, i) => {
            const x = getX(parseFloat(d.abertura.replace(',', '.')));
            return (
              <text key={i} x={x} y={yLabel} fontSize="8" textAnchor="middle" fill="#333">{d.astm}</text>
            );
          })}

          {/* Faixa especificada — mín */}
          {dadosGranulometria.some(d => d.limiteMin) && (
            <polyline
              points={dadosGranulometria.filter(d => d.limiteMin).map(d => `${getX(parseFloat(d.abertura.replace(',', '.')))} ,${getY(d.limiteMin)}`).join(' ')}
              fill="none" stroke="#dc2626" strokeWidth="1"
            />
          )}
          {/* Faixa especificada — máx */}
          {dadosGranulometria.some(d => d.limiteMax) && (
            <polyline
              points={dadosGranulometria.filter(d => d.limiteMax).map(d => `${getX(parseFloat(d.abertura.replace(',', '.')))} ,${getY(d.limiteMax)}`).join(' ')}
              fill="none" stroke="#dc2626" strokeWidth="1"
            />
          )}

          {/* Faixa de trabalho — mín */}
          {dadosGranulometria.some(d => d.faixaTrabalhoMin) && (
            <polyline
              points={dadosGranulometria.filter(d => d.faixaTrabalhoMin).map(d => `${getX(parseFloat(d.abertura.replace(',', '.')))} ,${getY(d.faixaTrabalhoMin)}`).join(' ')}
              fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2"
            />
          )}
          {/* Faixa de trabalho — máx */}
          {dadosGranulometria.some(d => d.faixaTrabalhoMax) && (
            <polyline
              points={dadosGranulometria.filter(d => d.faixaTrabalhoMax).map(d => `${getX(parseFloat(d.abertura.replace(',', '.')))} ,${getY(d.faixaTrabalhoMax)}`).join(' ')}
              fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2"
            />
          )}

          {/* Linha % passante do ensaio */}
          <polyline
            points={dadosGranulometria.map(d => `${getX(parseFloat(d.abertura.replace(',', '.')))} ,${getY(d.percentualPassante)}`).join(' ')}
            fill="none" stroke="#3b82f6" strokeWidth="2"
          />

          {/* Pontos interativos */}
          {dadosGranulometria.map((d, i) => {
            const x = getX(parseFloat(d.abertura.replace(',', '.')));
            const y = getY(d.percentualPassante);
            const pointData = {
              astm: d.astm,
              percentualPassante: d.percentualPassante,
              faixaEspecMin: d.limiteMin,
              faixaEspecMax: d.limiteMax,
              faixaTrabalhoMin: d.faixaTrabalhoMin,
              faixaTrabalhoMax: d.faixaTrabalhoMax,
            };
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2" fill="#3b82f6" />
                <rect
                  x={x - 8} y={y - 8} width="16" height="16" fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.astm}: ${d.percentualPassante}% passante`}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onPointHover(pointData, { x: x + 30, y });
                    }
                  }}
                  onMouseEnter={(e) => {
                    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
                    onPointHover(pointData, { x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
                  }}
                  onMouseLeave={onPointLeave}
                  onFocus={() => onPointHover(pointData, { x: x + 30, y })}
                  onBlur={onPointLeave}
                />
              </g>
            );
          })}

          {/* Legenda */}
          <g transform={`translate(230, ${yLegenda})`}>
            <line x1="0" y1="3" x2="15" y2="3" stroke="#3b82f6" strokeWidth="2" />
            <text x="18" y="5" fontSize="7" fill="#333">% Pass.</text>
            <line x1="60" y1="3" x2="75" y2="3" stroke="#dc2626" strokeWidth="1" />
            <text x="78" y="5" fontSize="7" fill="#333">Faixa especificada</text>
            <line x1="170" y1="3" x2="185" y2="3" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="188" y="5" fontSize="7" fill="#333">Faixa de Trabalho</text>
          </g>
        </svg>
      </div>
    </div>
  );
}