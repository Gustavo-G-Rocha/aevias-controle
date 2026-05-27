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
            <td className="border px-1 py-1 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)' }}>ESTACA</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.estaca || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-semibold" style={{ borderColor: 'rgb(148, 163, 184)' }}>PISTA</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.pista || ''}</td>
            ))}
          </tr>

          {/* Seção: Ensaio Densidade */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'hsl(214.29deg 31.82% 91.37%)', borderColor: 'rgb(148, 163, 184)' }}>
              ENSAIO DE DENSIDADE "IN SITU" - DNIT 458/25
            </td>
          </tr>

          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PESO AREIA NO FUNIL (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>
                {fmtN(ensaio.peso_areia_funil, 1)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>DENSIDADE DA AREIA (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>
                {fmtN(ensaio.densidade_areia, 3)}
              </td>
            ))}
          </tr>

          {ensaio.substituicao_retido_3_4 && (
            <tr>
              <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>DENSIDADE REAL RETIDA 3/4" (g/cm³)</td>
              {furos.map((furo, i) => (
                <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{ensaio.densidade_real_retida_3_4 || ''}</td>
              ))}
            </tr>
          )}

          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PROFUNDIDADE DO FURO (cm)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.profundidade_furo || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PESO AREIA+GARRAFA, ANTES (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.peso_areia_garrafa_antes || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PESO AREIA+GARRAFA, APÓS (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.peso_areia_garrafa_apos || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PESO MATERIAL ÚMIDO NO FURO (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.peso_material_umido_furo || ''}</td>
            ))}
          </tr>

          {ensaio.substituicao_retido_3_4 && (
            <tr>
              <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>PESO SOLO RETIDO 3/4" ÚMIDO (g)</td>
              {furos.map((furo, i) => (
                <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.peso_solo_retido_3_4_umido || ''}</td>
              ))}
            </tr>
          )}

          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>DENSIDADE ÚMIDA DO FURO (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(furo.densidade_umida_furo, 3)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>DENSIDADE SECA DO SOLO (g/cm³)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(furo.densidade_seca_solo, 3)}</td>
            ))}
          </tr>

          {/* Seção: Dados Proctor */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'hsl(214.29deg 31.82% 91.37%)', borderColor: 'rgb(148, 163, 184)' }}>
              DADOS DO PROCTOR
            </td>
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>DENS. SECA MÁX. (g/cm³)</td>
            {furos.map((_, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(ensaio.dados_proctor?.densidade_seca_max, 3)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>UMIDADE ÓTIMA (%)</td>
            {furos.map((_, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{ensaio.dados_proctor?.umidade_otima || ''}</td>
            ))}
          </tr>

          {/* Seção: Resultados */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'hsl(214.29deg 31.82% 91.37%)', borderColor: 'rgb(148, 163, 184)' }}>
              RESULTADOS
            </td>
          </tr>

          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>DESVIO DE UMIDADE (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(furo.desvio_umidade, 2)}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>GRAU DE COMPACTAÇÃO (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(furo.grau_compactacao, 2)}</td>
            ))}
          </tr>

          {/* Seção: Umidade */}
          <tr>
            <td colSpan={furos.length + 1} className="border px-1 py-1 font-semibold text-center text-[9px]" style={{ backgroundColor: 'hsl(214.29deg 31.82% 91.37%)', borderColor: 'rgb(148, 163, 184)' }}>
              ENSAIO DE UMIDADE "IN SITU" (hₐ) - NBR 16097/2012
            </td>
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>TARA DA FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.tara_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>MATERIAL ÚMIDO+FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.material_umido_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1" style={{ borderColor: 'rgb(148, 163, 184)' }}>MATERIAL SECO+FRIGIDEIRA (g)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center" style={{ borderColor: 'rgb(148, 163, 184)' }}>{furo.material_seco_frigideira || ''}</td>
            ))}
          </tr>
          <tr>
            <td className="border px-1 py-1 font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>UMIDADE (%)</td>
            {furos.map((furo, i) => (
              <td key={i} className="border px-1 py-1 text-center font-bold" style={{ borderColor: 'rgb(148, 163, 184)' }}>{fmtN(furo.umidade, 2)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}