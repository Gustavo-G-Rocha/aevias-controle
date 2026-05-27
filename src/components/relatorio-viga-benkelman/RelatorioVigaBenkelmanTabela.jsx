import React from 'react';
import { deflexaoExcedeLimite, temDadosLevantamento } from '@/utils/relatorioVigaBenkelmanUtils';

export default function RelatorioVigaBenkelmanTabela({ faixa, ensaio }) {
  const defAdmissivel = parseFloat(ensaio.def_admissivel) || 0;
  const stats = {
    bordoEsquerdo: { qt: 0, media: 0, desvPad: 0 },
    eixo: { qt: 0, media: 0, desvPad: 0 },
    bordoDireito: { qt: 0, media: 0, desvPad: 0 }
  };

  // Recalcular stats para a faixa
  if (faixa && faixa.levantamentos) {
    const be = faixa.levantamentos.map(l => l.bordo_esquerdo?.deflexao || 0).filter(v => v > 0);
    const eixo = faixa.levantamentos.map(l => l.eixo?.deflexao || 0).filter(v => v > 0);
    const bd = faixa.levantamentos.map(l => l.bordo_direito?.deflexao || 0).filter(v => v > 0);

    const calcStats = (arr) => {
      const qt = arr.length;
      const media = qt > 0 ? arr.reduce((a, b) => a + b) / qt : 0;
      const desvPad = qt > 0 ? Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / qt) : 0;
      return { qt, media, desvPad };
    };

    stats.bordoEsquerdo = calcStats(be);
    stats.eixo = calcStats(eixo);
    stats.bordoDireito = calcStats(bd);
  }

  return (
    <div className="mb-0 overflow-x-auto print:break-inside-avoid">
      <div className="bg-slate-200 px-1.5 py-0 font-bold text-center text-[8px] border" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px' }}>
        LEVANTAMENTO DEFLECTOMÉTRICO POR VIGA BENKELMAN
      </div>
      <table className="w-full border-collapse text-[7px]" style={{ borderWidth: '0.05px', tableLayout: 'fixed' }}>
        <colgroup>
          {Array.from({ length: 13 }).map((_, i) => (
            <col key={i} style={{ width: 'calc(100% / 13)' }} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-slate-100">
            <th rowSpan="2" className="px-1 py-0.5 text-center font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Estaca / km</th>
            <th colSpan="4" className="px-1 py-0.5 text-center font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>BORDO ESQUERDO</th>
            <th colSpan="4" className="px-1 py-0.5 text-center font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>EIXO</th>
            <th colSpan="4" className="px-1 py-0.5 text-center font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>BORDO DIREITO</th>
          </tr>
          <tr className="bg-slate-100">
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Inicial (A)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Final (B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Diferença (C = A - B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Deflexão (x10⁻²mm)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Inicial (A)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Final (B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Diferença (C = A - B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Deflexão (x10⁻²mm)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Inicial (A)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Leitura Final (B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Diferença (C = A - B)</th>
            <th className="px-1 py-0.5 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>Deflexão (x10⁻²mm)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, idx) => {
            const lev = faixa?.levantamentos?.[idx];
            const bgColor = idx % 2 === 0 ? 'bg-white' : 'bg-blue-50';

            const temBE = temDadosLevantamento(lev) && lev?.bordo_esquerdo?.leitura_final && lev.bordo_esquerdo.leitura_final !== 0;
            const temEixo = temDadosLevantamento(lev) && lev?.eixo?.leitura_final && lev.eixo.leitura_final !== 0;
            const temBD = temDadosLevantamento(lev) && lev?.bordo_direito?.leitura_final && lev.bordo_direito.leitura_final !== 0;

            const beExcede = deflexaoExcedeLimite(lev?.bordo_esquerdo?.deflexao || 0, defAdmissivel);
            const eixoExcede = deflexaoExcedeLimite(lev?.eixo?.deflexao || 0, defAdmissivel);
            const bdExcede = deflexaoExcedeLimite(lev?.bordo_direito?.deflexao || 0, defAdmissivel);

            return (
              <tr key={`lev-${idx}`} className={bgColor} style={{ height: '22px' }}>
                <td className="px-0.5 py-0 font-semibold text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>
                  {lev?.estaca_km || ''}
                </td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBE && lev.bordo_esquerdo.leitura_inicial !== 0 ? lev.bordo_esquerdo.leitura_inicial.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBE ? lev.bordo_esquerdo.leitura_final.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBE && lev.bordo_esquerdo.diferenca !== 0 ? lev.bordo_esquerdo.diferenca.toFixed(0) : ''}</td>
                <td className={`px-0.5 py-0 text-center font-semibold ${beExcede ? 'text-red-600' : ''}`} style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBE && lev.bordo_esquerdo.deflexao !== 0 ? lev.bordo_esquerdo.deflexao.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temEixo && lev.eixo.leitura_inicial !== 0 ? lev.eixo.leitura_inicial.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temEixo ? lev.eixo.leitura_final.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temEixo && lev.eixo.diferenca !== 0 ? lev.eixo.diferenca.toFixed(0) : ''}</td>
                <td className={`px-0.5 py-0 text-center font-semibold ${eixoExcede ? 'text-red-600' : ''}`} style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temEixo && lev.eixo.deflexao !== 0 ? lev.eixo.deflexao.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBD && lev.bordo_direito.leitura_inicial !== 0 ? lev.bordo_direito.leitura_inicial.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBD ? lev.bordo_direito.leitura_final.toFixed(0) : ''}</td>
                <td className="px-0.5 py-0 text-center" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBD && lev.bordo_direito.diferenca !== 0 ? lev.bordo_direito.diferenca.toFixed(0) : ''}</td>
                <td className={`px-0.5 py-0 text-center font-semibold ${bdExcede ? 'text-red-600' : ''}`} style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{temBD && lev.bordo_direito.deflexao !== 0 ? lev.bordo_direito.deflexao.toFixed(0) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Controle Estatístico */}
      <table className="w-full border-collapse text-[7px]" style={{ borderWidth: '0.05px', tableLayout: 'fixed' }}>
        <colgroup>
          {Array.from({ length: 13 }).map((_, i) => (
            <col key={i} style={{ width: 'calc(100% / 13)' }} />
          ))}
        </colgroup>
        <tbody>
          <tr className="bg-white">
            <td rowSpan="3" className="px-0.5 py-0.5 text-center font-semibold align-middle" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>CONTROLE<br/>ESTATÍSTICO</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>QT. LEITURAS:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoEsquerdo.qt}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>QT. LEITURAS:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.eixo.qt}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>QT. LEITURAS:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoDireito.qt}</td>
          </tr>
          <tr className="bg-white">
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>MÉDIA:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoEsquerdo.media.toFixed(0)}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>MÉDIA:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.eixo.media.toFixed(0)}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>MÉDIA:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoDireito.media.toFixed(0)}</td>
          </tr>
          <tr className="bg-white">
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>DESV. PAD.:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoEsquerdo.desvPad.toFixed(0)}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>DESV. PAD.:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.eixo.desvPad.toFixed(0)}</td>
            <td colSpan="3" className="px-0.5 py-0.5 text-left font-semibold text-[6px]" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>DESV. PAD.:</td>
            <td className="px-0.5 py-0.5 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px', borderStyle: 'solid' }}>{stats.bordoDireito.desvPad.toFixed(0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}