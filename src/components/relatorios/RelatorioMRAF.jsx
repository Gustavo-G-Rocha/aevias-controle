import React, { useState } from 'react';
import { buildSignatureProps } from '@/utils/relatorioUtils';
import { calcularGranulometria } from '@/utils/relatorioMRAFUtils';
import SignatureFooter from './SignatureFooter';
import PrintStyles from './PrintStyles';
import RelatorioMRAFHeader from '@/components/relatorio-mraf/RelatorioMRAFHeader.jsx';
import RelatorioMRAFDadosObra from '@/components/relatorio-mraf/RelatorioMRAFDadosObra.jsx';
import RelatorioMRAFTabelas from '@/components/relatorio-mraf/RelatorioMRAFTabelas.jsx';
import RelatorioMRAFGraficos from '@/components/relatorio-mraf/RelatorioMRAFGraficos.jsx';
import RelatorioMRAFObservacoes from '@/components/relatorio-mraf/RelatorioMRAFObservacoes.jsx';
import RelatorioMRAFActions from '@/components/relatorio-mraf/RelatorioMRAFActions.jsx';

export default function RelatorioMRAF({ ensaio, obra, project, user: _user, regional, faixaGranulometrica }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const dadosGranulometria = calcularGranulometria(ensaio, faixaGranulometrica, project);

  return (
    <div>
      <RelatorioMRAFActions ensaio={ensaio} onPrint={() => window.print()} />

      <div className="w-full max-w-[270mm] mx-auto bg-white shadow-xl print:shadow-none pt-6 px-8 pb-6 print:pt-4 print:px-4 print:pb-4">
        <RelatorioMRAFHeader ensaio={ensaio} regional={regional} />

        <main className="text-sm print:text-sm">
          <RelatorioMRAFDadosObra 
            ensaio={ensaio} 
            obra={obra} 
            project={project} 
            regional={regional} 
            faixa={faixaGranulometrica}
          />

          <RelatorioMRAFTabelas 
            ensaio={ensaio} 
            project={project} 
            faixa={faixaGranulometrica} 
            dadosGranulometria={dadosGranulometria}
          />

          <RelatorioMRAFGraficos 
            dadosGranulometria={dadosGranulometria}
            hoveredPoint={hoveredPoint}
            tooltipPos={tooltipPos}
            onPointHover={(point, pos) => { setHoveredPoint(point); setTooltipPos(pos); }}
            onPointLeave={() => setHoveredPoint(null)}
          />

          <RelatorioMRAFObservacoes ensaio={ensaio} />
        </main>

        <footer className="px-3 print:break-inside-avoid print:px-2 mt-4 print:mt-3">
          <SignatureFooter {...buildSignatureProps(ensaio)} sizePrint={true} />
        </footer>
      </div>

      <PrintStyles />
    </div>
  );
}