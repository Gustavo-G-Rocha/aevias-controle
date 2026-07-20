/**
 * Seção de densidade in situ do boletim.
 */
import React from 'react';
import { formatNumber } from '@/utils/relatorioBoletimSondagemTradoUtils';

export default function BoletimDensidades({ boletim, densidades }) {
  if (!boletim.ensaio_insitu_realizado || !densidades || densidades.length === 0) {
    return null;
  }

  const rows = [
    { label: 'Camada ensaiada', field: 'camada_ensaiada', isNum: false },
    { label: 'VOLUME', section: true },
    { label: 'Peso do frasco antes (gf)', field: 'peso_frasco_antes', isNum: true },
    { label: 'Peso do frasco depois (gf)', field: 'peso_frasco_depois', isNum: true },
    { label: 'Peso areia funil e placa (gf)', field: 'peso_areia_funil_placa', isNum: true },
    { label: 'Massa esp. aparente areia (g/dm³)', field: 'massa_esp_aparente_areia', isNum: true },
    { label: 'Peso areia na cavidade (gf)', field: 'peso_areia_cavidade', isNum: true },
    { label: 'Volume do buraco (dm³)', field: 'volume_buraco', isNum: true, dec: 3 },
    { label: 'MASSA', section: true },
    { label: 'Peso solo + recipiente (gf)', field: 'peso_solo_recipiente', isNum: true },
    { label: 'Peso do recipiente (gf)', field: 'peso_recipiente', isNum: true },
    { label: 'Peso do solo (gf)', field: 'peso_solo', isNum: true },
    { label: 'UMIDADE', section: true },
    { label: 'Peso do solo úmido (gf)', field: 'peso_solo_umido', isNum: true },
    { label: 'Peso do solo seco (gf)', field: 'peso_solo_seco', isNum: true },
    { label: 'Teor de umidade (%)', field: 'teor_umidade', isNum: true },
    { label: 'RESULTADOS', section: true },
    { label: 'Dens. Aparente Solo Úmido (g/dm³)', field: 'densidade_aparente_solo_umido', isNum: true, dec: 3, result: true },
    { label: 'Dens. Aparente Solo Seco (g/dm³)', field: 'densidade_aparente_solo_seco', isNum: true, dec: 3, result: true },
  ];

  return (
    <section>
      <div className="bg-[#BFCF99] text-[#00233B] px-2 py-0.5 font-bold text-center text-[10px] mb-1">
        MASSA ESPECÍFICA APARENTE IN SITU — DNER-ME 092/94
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr className="bg-[#E8EDD5]">
            <th className="px-2 py-0.5 text-left font-bold">
              Campo
            </th>
            {densidades.map((_, i) => (
              <th
                key={i}
                className="px-2 py-0.5 text-center font-bold"
              >
                Ensaio {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.section) {
              return (
                <tr key={`section-${row.label}`} className="bg-[#BFCF99]">
                  <td
                    colSpan={densidades.length + 1}
                    className="px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider text-[#00233B]"
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }
            return (
              <tr
                key={row.field}
                className={row.result ? 'bg-[#E8EDD5] font-bold' : 'bg-white'}
              >
                <td className="px-2 py-0.5 text-gray-700">
                  {row.label}
                </td>
                {densidades.map((d, di) => (
                  <td
                    key={di}
                    className={`px-2 py-0.5 text-center font-semibold ${
                      row.result ? 'text-[#00233B]' : ''
                    }`}
                  >
                    {row.isNum
                      ? formatNumber(d[row.field], row.dec ?? 2)
                      : d[row.field] || '-'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}