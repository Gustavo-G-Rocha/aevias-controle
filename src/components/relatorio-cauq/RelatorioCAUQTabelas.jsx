import React from 'react';
import { getHeightClass, calcularMedia } from '@/utils/relatorioCAUQUtils';
import { getPaddingClass, getTableFontSize, estáForaDaFaixa, estáAbaixoMin, fmtNum } from '@/utils/relatorioCAUQTabelasUtils';
import CellsCP from './tabelas/CellsCP';
import MarshallRowSimples from './tabelas/MarshallRowSimples';
import MarshallSecaoRTCDEstabilidade from './tabelas/MarshallSecaoRTCDEstabilidade';

/**
 * Seção "DADOS DO ENSAIO" — tabelas de granulometria, extração de ligante,
 * Marshall, RICE e observações.
 */
export default function RelatorioCAUQTabelas({ ensaio, project, faixa, dadosGranulometria }) {
  const corposProva = ensaio.corpos_prova_marshall || [];
  const cpsValidos  = corposProva.slice(0, 6);

  const media = (campo) => calcularMedia(cpsValidos, campo);

  const numPeneiras  = dadosGranulometria.length;
  const heightClass  = (idx) => getHeightClass(numPeneiras, ensaio.realizar_marshall);
  const paddingClass = ensaio.realizar_marshall ? 'px-0' : 'px-1.5';
  const paddingExtracaoLigante = getPaddingClass(ensaio.realizar_marshall);
  const fontSizeGranulometria = getTableFontSize(ensaio.realizar_marshall, 'granulometria_header');
  const fontSizeExtracao = getTableFontSize(ensaio.realizar_marshall, 'extracao_header');

  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-1 py-0 font-bold text-center mb-0 mt-0 text-[8px] leading-tight">
        DADOS DO ENSAIO
      </div>

      {/* Granulometria + Extração Ligante */}
      <div className={`grid ${ensaio.realizar_marshall ? 'grid-cols-12 gap-0' : 'grid-cols-12 gap-2'} mb-0`}>
        {/* Granulometria */}
        <div className={`${ensaio.realizar_marshall ? 'col-span-7' : 'col-span-7'} border border-slate-400`}>
          <div className={`bg-slate-200 font-bold text-center border-b border-slate-400 ${ensaio.realizar_marshall ? 'px-0.5 py-0 text-[9px]' : 'px-1.5 py-1 text-[11px]'}`}>
            ENSAIO DE GRANULOMETRIA - DNIT 412/2025
          </div>
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${ensaio.realizar_marshall ? 'text-[7px]' : 'text-[9px]'} leading-tight`}>
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan="2" className={`border-r border-slate-300 font-bold leading-tight ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-2 py-1'}`}>PENEIRAS<br />ASTM (mm)</th>
                  <th colSpan="3" className={`border-r border-slate-300 font-bold text-center leading-tight ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-2 py-1'}`}>PESO DA AMOSTRA (g)</th>
                  <th colSpan="2" className={`border-r border-slate-300 font-bold text-center leading-tight ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-2 py-1'}`}>FAIXA DE TRABALHO</th>
                  <th colSpan="2" className={`font-bold text-center leading-tight ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-2 py-1'}`}>FAIXA ESPECIFICADA<br />{faixa?.especificacao || ''}</th>
                </tr>
                <tr className="bg-slate-100">
                  {['RETIDO (g)', 'PASS. (g)', '% PASS.', 'MÍN. (%)', 'MÁX. (%)', 'MÍN. (%)', 'MÁX. (%)'].map((h, i) => (
                    <th key={i} className={`${i < 6 ? 'border-r border-slate-300' : ''} font-bold leading-tight ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-2 py-1'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosGranulometria.map((dado, idx) => {
                  const hc = heightClass(idx);
                  const foraFaixa = estáForaDaFaixa(dado.percentualPassante, dado.faixaTrabalhoMin, dado.faixaTrabalhoMax);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center font-semibold ${hc}`}>{dado.astm}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center ${hc}`}>{dado.retido}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center ${hc}`}>{dado.passante}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center font-semibold ${hc} ${foraFaixa ? 'text-red-600' : ''}`}>{dado.percentualPassante}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center ${hc}`}>{fmtNum(dado.faixaTrabalhoMin, 1)}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center ${hc}`}>{fmtNum(dado.faixaTrabalhoMax, 1)}</td>
                      <td className={`border-r border-slate-300 ${paddingClass} text-center ${hc}`}>{fmtNum(dado.limiteMin, 1)}</td>
                      <td className={`${paddingClass} text-center ${hc}`}>{fmtNum(dado.limiteMax, 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extração de Ligante */}
        <div className="col-span-5">
          <div className={`border border-slate-400 ${ensaio.realizar_marshall ? 'border-l-0' : ''}`}>
            <div className={`bg-slate-200 font-bold text-center border-b border-slate-400 leading-tight ${fontSizeExtracao} ${ensaio.realizar_marshall ? 'px-0.5 py-0' : 'px-1.5 py-1'}`}>
              EXTRAÇÃO LIGANTE (ROTAREX)<br />ABNT NBR 16208/2013
            </div>
            <table className={`w-full border-collapse table-fixed ${ensaio.realizar_marshall ? 'text-[7px]' : 'text-[9px]'}`}>
              <colgroup>
                <col className="w-[35%]" />
                <col className="w-[65%]" />
              </colgroup>
              <tbody>
                <tr className="bg-white">
                  <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>TEMP. CAP:</td>
                  <td className={`${paddingExtracaoLigante}`}>{ensaio.temperatura_cap || '-'}°C</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>TIPO LIG.:</td>
                  <td className={`${paddingExtracaoLigante}`}>{ensaio.tipo_ligante || '-'}</td>
                </tr>

                {ensaio.extracao_ligante && (
                  <>
                    <tr className="bg-white">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>AM. C/ LIG.:</td>
                      <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.amostra_com_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>AM. S/ LIG.:</td>
                      <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.amostra_sem_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-white">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>FAT. CORR.:</td>
                      <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.fator_correcao || '1.0000'}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>PESO LIG.:</td>
                      <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.peso_ligante || '-'} g</td>
                    </tr>
                    <tr className="bg-white">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>TEOR LIG.:</td>
                      <td className={`font-semibold ${paddingExtracaoLigante} ${
                        estáForaDaFaixa(ensaio.extracao_ligante.teor_ligante, project?.teor_ligante?.min, project?.teor_ligante?.max)
                          ? 'text-red-600'
                          : ''
                      }`}>{ensaio.extracao_ligante.teor_ligante || '-'}%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>FILLER/BET.:</td>
                      <td className={`font-semibold ${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.filler_betume || '-'}</td>
                    </tr>

                    {ensaio.extracao_ligante.teor_ligante_real && (
                      <tr className="bg-blue-50">
                        <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>TEOR LIG. REAL:</td>
                        <td className={`font-semibold ${paddingExtracaoLigante} ${
                          estáForaDaFaixa(ensaio.extracao_ligante.teor_ligante_real, project?.teor_ligante?.min, project?.teor_ligante?.max)
                            ? 'text-red-600'
                            : 'text-blue-700'
                        }`}>{ensaio.extracao_ligante.teor_ligante_real}%</td>
                      </tr>
                    )}

                    {ensaio.extracao_ligante.amostra_umida != null && (
                      <>
                        <tr className="bg-blue-50">
                          <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>AM. ÚMIDA:</td>
                          <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.amostra_umida ?? '-'} g</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>AM. SECA:</td>
                          <td className={`${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.amostra_seca ?? '-'} g</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className={`border-r border-slate-300 font-bold ${paddingExtracaoLigante}`}>UMIDADE:</td>
                          <td className={`font-semibold text-blue-700 ${paddingExtracaoLigante}`}>{ensaio.extracao_ligante.umidade ?? '-'}%</td>
                        </tr>
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Marshall */}
      {ensaio.realizar_marshall && (
        <>
          <div className="bg-slate-200 px-0.5 py-0 text-[8px] font-bold text-center border-b border-slate-400 mt-0 print:text-[7px] print:py-0">
            ENSAIO MARSHALL - MÉTODO DE ENSAIO DNIT 447/2024
          </div>
          <div className="overflow-x-auto mb-0 print:mb-0">
            <table className="w-full border-collapse border border-slate-400 text-[8px] table-fixed">
              <colgroup>
                <col style={{ width: '23%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-200">
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">CORPO DE PROVA</th>
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">UN.</th>
                  <th colSpan="6" className="border border-slate-400 px-0 py-0 font-bold text-center text-[7px]">CORPO DE PROVA</th>
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">MÉDIA</th>
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">PROJ.</th>
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">MÍN.</th>
                  <th rowSpan="2" className="border border-slate-400 px-0 py-0 font-bold text-[7px]">MÁX.</th>
                </tr>
                <tr className="bg-slate-200">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <th key={num} className="border border-slate-400 px-0 py-0 font-bold text-[7px]">{num}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Linhas simples (sem média ou com média fixa) */}
                {[
                  { label: 'peso_ar',       un: 'g',     bg: 'bg-white'   },
                  { label: 'peso_imerso',   un: 'g',     bg: 'bg-slate-50' },
                  { label: 'peso_sss',      un: 'g',     bg: 'bg-white'   },
                  { label: 'volume',        un: 'cm³',   bg: 'bg-slate-50' },
                ].map(({ label, un, bg }) => (
                  <MarshallRowSimples
                    key={label}
                    label={label.toUpperCase().replace(/_/g, ' ')}
                    unidade={un}
                    cpsValidos={cpsValidos}
                    bg={bg}
                  />
                ))}

                {/* Densidade aparente */}
                <tr className="bg-white">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">DENSIDADE APARENTE</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">g/cm³</td>
                  <CellsCP cpsValidos={cpsValidos} campo="densidade_aparente" bold />
                  <td className="border border-slate-400 px-0 py-0 text-center font-bold text-[7px]">{media('densidade_aparente')}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{project?.massa_especifica_aparente || '-'}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                </tr>

                {/* Volume de vazios */}
                <tr className="bg-slate-50">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">VOLUME DE VAZIOS</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">%</td>
                  <CellsCP cpsValidos={cpsValidos} campo="volume_vazios" bold />
                  <td className={`border border-slate-400 px-0 py-0 text-center font-bold text-[7px] ${
                    estáForaDaFaixa(media('volume_vazios'), project?.volume_vazios?.min, project?.volume_vazios?.max) ? 'text-red-600' : ''
                  }`}>{media('volume_vazios')}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.volume_vazios?.min, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.volume_vazios?.max, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.volume_vazios?.otimo, 1)}</td>
                </tr>

                {/* VCB */}
                <tr className="bg-white">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">V.C.B.</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">%</td>
                  <CellsCP cpsValidos={cpsValidos} campo="vcb" />
                  <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                </tr>

                {/* VAM */}
                <tr className="bg-slate-50">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">V.A.M.</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">%</td>
                  <CellsCP cpsValidos={cpsValidos} campo="vam" />
                  <td className={`border border-slate-400 px-0 py-0 text-center font-semibold text-[7px] ${
                    estáAbaixoMin(media('vam'), project?.vam?.min) ? 'text-red-600' : ''
                  }`}>-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.vam?.projeto, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.vam?.min, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                </tr>

                {/* RBV */}
                <tr className="bg-white">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">R.B.V.</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">%</td>
                  <CellsCP cpsValidos={cpsValidos} campo="rbv" />
                  <td className={`border border-slate-400 px-0 py-0 text-center font-semibold text-[7px] ${
                    estáForaDaFaixa(media('rbv'), project?.rbv?.min, project?.rbv?.max) ? 'text-red-600' : ''
                  }`}>-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.rbv?.projeto, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.rbv?.min, 1)}</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">{fmtNum(project?.rbv?.max, 1)}</td>
                </tr>

                {/* ALTURA */}
                <tr className="bg-slate-50">
                  <td className="border border-slate-400 px-0 py-0 font-semibold text-[7px]">ALTURA</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">cm</td>
                  <CellsCP cpsValidos={cpsValidos} campo="altura" />
                  <td className="border border-slate-400 px-0 py-0 text-center font-semibold text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                  <td className="border border-slate-400 px-0 py-0 text-center text-[7px]">-</td>
                </tr>

                {/* RTCD / Estabilidade dinâmico */}
                <MarshallSecaoRTCDEstabilidade
                  cpsValidos={cpsValidos}
                  media={media}
                  project={project}
                />
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Densidade RICE */}
      {ensaio.realizar_marshall && ensaio.densidade_rice && (
        <div className="mt-0 print:mt-0">
          <div className="bg-slate-200 px-0.5 py-0 text-[8px] font-bold text-center border-b border-slate-400 print:text-[7px] print:py-0">
            ENSAIO DE DENSIDADE RICE (DMT) - DNIT 427/20 - ABNT NBR 15619/16
          </div>
          <div className="grid grid-cols-6 gap-0.5 text-[8px] p-0.5 border border-slate-400 border-t-0 print:text-[6px] print:p-0 print:gap-0">
            {[
              { label: 'FR+ÁGUA (g):',         val: ensaio.densidade_rice.frasco_agua         },
              { label: 'AMOSTRA (g):',          val: ensaio.densidade_rice.amostra             },
              { label: 'FR+ÁGUA+AMOSTRA (g):',  val: ensaio.densidade_rice.frasco_agua_amostra },
              { label: 'TEMP. - ÁGUA (°C):',    val: ensaio.densidade_rice.temperatura_agua    },
              { label: 'DENS. - ÁGUA (g/cm³):', val: ensaio.densidade_rice.densidade_agua      },
              { label: 'DENS. RICE (g/cm³):',   val: ensaio.densidade_rice.densidade_rice,     bold: true },
            ].map(({ label, val, bold }) => (
              <div key={label}>
                <p className="font-bold">{label}</p>
                <p className={bold ? 'font-semibold' : ''}>{val || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {!ensaio.realizar_marshall && !ensaio.realizar_densidade_rice && (
        <div className="mt-0 print:mt-0 print:mb-1">
          <div className="bg-slate-200 font-bold px-2 py-1 text-[10px] print:text-[8px] print:py-1">OBSERVAÇÕES</div>
          <div className="border border-slate-300 p-2 text-[10px] h-[60px] print:text-[8px] print:p-1 print:h-[45px] overflow-hidden">
            {ensaio.observacoes || ''}
          </div>
        </div>
      )}
      {ensaio.realizar_marshall && ensaio.observacoes && (
        <div className="mt-0 print:mt-0 mb-0">
          <div className="bg-slate-200 font-bold px-1 py-0 text-[8px] print:text-[7px] print:py-0">OBSERVAÇÕES</div>
          <div className="border border-slate-300 p-0.5 text-[8px] min-h-[12px] print:text-[6px] print:p-0 print:px-0.5 print:min-h-[8px]">
            {ensaio.observacoes}
          </div>
        </div>
      )}
    </>
  );
}