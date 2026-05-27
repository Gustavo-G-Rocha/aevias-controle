import React from 'react';
import { getXLog, getYGraph } from '@/utils/relatorioMRAFUtils';

export default function RelatorioMRAFGraficos({ 
  dadosGranulometria, 
  hoveredPoint, 
  tooltipPos, 
  onPointHover, 
  onPointLeave 
}) {
  return (
    <div className="border border-slate-300 p-3 print:p-2 mb-3 print:mb-2">
      <h3 className="font-bold text-center mb-2 py-1 print:py-0.5 text-[10px] print:text-[9px]">GRANULOMETRIA DA MISTURA</h3>
      <div className="relative h-72 print:h-64">
        {hoveredPoint && (
          <div 
            className="absolute bg-white border-2 border-slate-300 rounded-lg shadow-lg p-2 text-[8px] z-50 pointer-events-none"
            style={{
              left: `${tooltipPos.x + 10}px`,
              top: `${tooltipPos.y - 10}px`,
              transform: 'translateY(-100%)'
            }}
          >
            <div className="font-bold text-slate-800 mb-1">{hoveredPoint.astm}</div>
            {hoveredPoint.faixaEspecMin && (
              <div className="text-red-600">Faixa Especificada: {hoveredPoint.faixaEspecMin}%</div>
            )}
            {hoveredPoint.faixaEspecMax && (
              <div className="text-red-600">Faixa Especificada: {hoveredPoint.faixaEspecMax}%</div>
            )}
            {hoveredPoint.faixaTrabalhoMin && (
              <div className="text-amber-600">Faixa de Trabalho Mín: {hoveredPoint.faixaTrabalhoMin}%</div>
            )}
            {hoveredPoint.faixaTrabalhoMax && (
              <div className="text-amber-600">Faixa de Trabalho Máx: {hoveredPoint.faixaTrabalhoMax}%</div>
            )}
            <div className="text-blue-600 font-semibold">% Passante (Ensaio): {hoveredPoint.percentualPassante}%</div>
          </div>
        )}
        <svg width="100%" height="100%" viewBox="0 0 640 300" preserveAspectRatio="xMidYMid meet" aria-label="Gráfico de Granulometria da Mistura MRAF" role="img">
          <line x1="30" y1="5" x2="30" y2="240" stroke="#333" strokeWidth="1" />
          <line x1="30" y1="240" x2="620" y2="240" stroke="#333" strokeWidth="1" />

          {[0, 20, 40, 60, 80, 100].map((value) => {
            const y = 240 - ((value - 0) / 100 * 235);
            return (
              <g key={value}>
                <line x1="30" y1={y} x2="620" y2={y} stroke="#e0e0e0" strokeWidth="0.5" />
                <text x="25" y={y + 3} fontSize="9" textAnchor="end" fill="#333">{value}%</text>
              </g>
            );
          })}

          {(() => {
            if (dadosGranulometria.length === 0) return null;

            const aberturas = dadosGranulometria.map(d => parseFloat(d.abertura.replace(',', '.')));
            const minAbertura = Math.min(...aberturas);
            const maxAbertura = Math.max(...aberturas);

            return (
              <>
                {dadosGranulometria.map((d, i) => {
                  const aberturaMm = parseFloat(d.abertura.replace(',', '.'));
                  const x = getXLog(aberturaMm, minAbertura, maxAbertura);
                  return (
                    <text key={i} x={x} y="255" fontSize="9" textAnchor="middle" fill="#333">
                      {d.astm}
                    </text>
                  );
                })}

                {dadosGranulometria.some(d => d.limiteMin) && (
                  <polyline
                    points={dadosGranulometria.filter(d => d.limiteMin).map(d => {
                      const x = getXLog(parseFloat(d.abertura.replace(',', '.')), minAbertura, maxAbertura);
                      const y = getYGraph(d.limiteMin);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                )}
                {dadosGranulometria.some(d => d.limiteMax) && (
                  <polyline
                    points={dadosGranulometria.filter(d => d.limiteMax).map(d => {
                      const x = getXLog(parseFloat(d.abertura.replace(',', '.')), minAbertura, maxAbertura);
                      const y = getYGraph(d.limiteMax);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                )}

                {dadosGranulometria.some(d => d.faixaTrabalhoMin) && (
                  <polyline
                    points={dadosGranulometria.filter(d => d.faixaTrabalhoMin).map(d => {
                      const x = getXLog(parseFloat(d.abertura.replace(',', '.')), minAbertura, maxAbertura);
                      const y = getYGraph(d.faixaTrabalhoMin);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                  />
                )}
                {dadosGranulometria.some(d => d.faixaTrabalhoMax) && (
                  <polyline
                    points={dadosGranulometria.filter(d => d.faixaTrabalhoMax).map(d => {
                      const x = getXLog(parseFloat(d.abertura.replace(',', '.')), minAbertura, maxAbertura);
                      const y = getYGraph(d.faixaTrabalhoMax);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                  />
                )}

                <polyline
                  points={dadosGranulometria.map(d => {
                    const x = getXLog(parseFloat(d.abertura.replace(',', '.')), minAbertura, maxAbertura);
                    const y = getYGraph(d.percentualPassante);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {dadosGranulometria.map((d, i) => {
                  const aberturaMm = parseFloat(d.abertura.replace(',', '.'));
                  const x = getXLog(aberturaMm, minAbertura, maxAbertura);
                  const y = getYGraph(d.percentualPassante);
                  const pointData = {
                    astm: d.astm,
                    percentualPassante: d.percentualPassante,
                    faixaEspecMin: d.limiteMin,
                    faixaEspecMax: d.limiteMax,
                    faixaTrabalhoMin: d.faixaTrabalhoMin,
                    faixaTrabalhoMax: d.faixaTrabalhoMax
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
                        onFocus={() => {
                          onPointHover(pointData, { x: x + 30, y });
                        }}
                        onBlur={onPointLeave}
                      />
                    </g>
                  );
                })}

                <g transform="translate(230, 270)">
                  <line x1="0" y1="3" x2="15" y2="3" stroke="#3b82f6" strokeWidth="2" />
                  <text x="18" y="6" fontSize="8" fill="#333">% Pass.</text>

                  <line x1="60" y1="3" x2="75" y2="3" stroke="#dc2626" strokeWidth="1" />
                  <text x="78" y="6" fontSize="8" fill="#333">Faixa especificada</text>

                  <line x1="170" y1="3" x2="185" y2="3" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
                  <text x="188" y="6" fontSize="8" fill="#333">Faixa de Trabalho</text>
                </g>
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}