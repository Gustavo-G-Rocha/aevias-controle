import React from "react";

export default function RelatorioSondagemGrafico({ dados }) {
  if (!dados.gcDensProjeto.length) return null;

  const { gcDensProjeto, gcDensRice, minGCChart, maxGCChart, limiteMin, limiteMax } = dados;

  return (
    <div className="mb-1 mt-1">
      <div className="border border-slate-300 p-0.5">
        <h3 className="text-[10px] font-bold text-center mb-0.5">G.C. (%)</h3>
        <div className="relative h-20">
          <svg width="100%" height="100%" viewBox="0 0 600 100" aria-label="Gráfico de Grau de Compactação" role="img">
            {/* Eixos */}
            <line x1="30" y1="5" x2="30" y2="75" stroke="#333" strokeWidth="1" />
            <line x1="30" y1="75" x2="580" y2="75" stroke="#333" strokeWidth="1" />

            {/* Valores do eixo Y */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const value = minGCChart + (maxGCChart - minGCChart) * (percent / 100);
              const y = 75 - (percent * 0.7);
              return (
                <g key={percent}>
                  <line x1="27" y1={y} x2="30" y2={y} stroke="#666" strokeWidth="0.5" />
                  <text x="24" y={y + 2} fontSize="6" textAnchor="end" fill="#333">
                    {value.toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Limites baseados no serviço */}
            {limiteMin > 0 && (
              <>
                <line
                  x1="30"
                  y1={75 - (((limiteMin - minGCChart) / (maxGCChart - minGCChart)) * 70)}
                  x2="580"
                  y2={75 - (((limiteMin - minGCChart) / (maxGCChart - minGCChart)) * 70)}
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
                <line
                  x1="30"
                  y1={75 - (((limiteMax - minGCChart) / (maxGCChart - minGCChart)) * 70)}
                  x2="580"
                  y2={75 - (((limiteMax - minGCChart) / (maxGCChart - minGCChart)) * 70)}
                  stroke="#dc2626"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
              </>
            )}

            {/* Barras G.C. Dens. Projeto */}
            {gcDensProjeto.map((gc, idx) => {
              const x = 50 + (idx * 50);
              const barHeight = ((gc - minGCChart) / (maxGCChart - minGCChart)) * 70;
              const y = 75 - barHeight;
              return (
                <g key={`bar-${idx}`}>
                  <rect x={x} y={y} width="18" height={barHeight} fill="#3498db" opacity="0.7" />
                  <text x={x + 20} y="83" fontSize="8" textAnchor="middle" fill="#333">
                    {idx + 1}
                  </text>
                </g>
              );
            })}

            {/* Barras G.C. Dens. RICE */}
            {gcDensRice.map((gc, idx) => {
              const x = 50 + (idx * 50) + 20;
              const barHeight = ((gc - minGCChart) / (maxGCChart - minGCChart)) * 70;
              const y = 75 - barHeight;
              return (
                <rect key={idx} x={x} y={y} width="18" height={barHeight} fill="#e74c3c" opacity="0.7" />
              );
            })}

            {/* Legenda */}
            <g transform="translate(170, 88)">
              <rect x="0" y="0" width="10" height="3" fill="#3498db" opacity="0.7" />
              <text x="13" y="3" fontSize="7" fill="#333">
                G.C. Dens. Projeto
              </text>

              <rect x="100" y="0" width="10" height="3" fill="#e74c3c" opacity="0.7" />
              <text x="113" y="3" fontSize="7" fill="#333">
                G.C. Dens. RICE
              </text>

              <line x1="200" y1="1.5" x2="210" y2="1.5" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4,2" />
              <text x="213" y="3" fontSize="7" fill="#333">
                Limites
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}