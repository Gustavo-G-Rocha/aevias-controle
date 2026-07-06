import React from 'react';
import { fmtN } from '@/utils/relatorioDensidadeInSituUtils';

export default function RelatorioDensidadeInSituTabela({ ensaio }) {
  const furos = ensaio.furos || [];

  return (
    <div className="space-y-2">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-2 py-0.5 font-bold text-center mb-1 text-xs">
        DADOS DE ENSAIO
      </div>

      <table className="w-full border-collapse text-[9px]">
        <tbody>
          {/* Cabeçalho: Estaca e Pista */}
          <tr>
            <td className="border px-1 py-1 font-semibold" style={{ borderColor: 'var(--color-border-strong)' }}>ESTACA</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.estaca || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-semibold" style={{ borderColor: 'var(--color-border-strong)' }}>PISTA</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.pista || ''}</td>
            ))}
          </tr>

          {/* Seção: Ensaio Densidade */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-strong)' }}>
              ENSAIO DE DENSIDADE "IN SITU" - DNIT 458/25
            </td>
          </tr>

          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PESO AREIA NO FUNIL (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                {fmtN(ensaio.peso_areia_funil, 1)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>DENSIDADE DA AREIA (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                {fmtN(ensaio.densidade_areia, 3)}
              </td>
            ))}
          </tr>

          {ensaio.substituicao_retido_3_4 && (
            <tr>
              <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>DENSIDADE REAL RETIDA 3/4" (g/cm³)</td>
              {furos.map((furo, i) => (
                <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{ensaio.densidade_real_retida_3_4 || ''}</td>
              ))}
            </tr>
          )}

          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PROFUNDIDADE DO FURO (cm)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.profundidade_furo || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PESO AREIA+GARRAFA, ANTES (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.peso_areia_garrafa_antes || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PESO AREIA+GARRAFA, APÓS (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.peso_areia_garrafa_apos || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PESO MATERIAL ÚMIDO NO FURO (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.peso_material_umido_furo || ''}</td>
            ))}
          </tr>

          {ensaio.substituicao_retido_3_4 && (
            <tr>
              <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>PESO SOLO RETIDO 3/4" ÚMIDO (g)</td>
              {furos.map((furo, i) => (
                <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.peso_solo_retido_3_4_umido || ''}</td>
              ))}
            </tr>
          )}

          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>DENSIDADE ÚMIDA DO FURO (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(furo.densidade_umida_furo, 3)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>DENSIDADE SECA DO SOLO (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(furo.densidade_seca_solo, 3)}</td>
            ))}
          </tr>

          {/* Seção: Dados Proctor */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-strong)' }}>
              DADOS DO PROCTOR
            </td>
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>DENS. SECA MÁX. (g/cm³)</td>
            {furos.map((_, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(ensaio.dados_proctor?.densidade_seca_max, 3)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>UMIDADE ÓTIMA (%)</td>
            {furos.map((_, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{ensaio.dados_proctor?.umidade_otima || ''}</td>
            ))}
          </tr>

          {/* Seção: Resultados */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-strong)' }}>
              RESULTADOS
            </td>
          </tr>

          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>DESVIO DE UMIDADE (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(furo.desvio_umidade, 2)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>GRAU DE COMPACTAÇÃO (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(furo.grau_compactacao, 2)}</td>
            ))}
          </tr>

          {/* Seção: Umidade */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-strong)' }}>
              ENSAIO DE UMIDADE "IN SITU" (hₐ) - NBR 16097/2012
            </td>
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>TARA DA FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.tara_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>MATERIAL ÚMIDO+FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.material_umido_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'var(--color-border-strong)' }}>MATERIAL SECO+FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>{furo.material_seco_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>UMIDADE (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'var(--color-border-strong)' }}>{fmtN(furo.umidade, 2)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}