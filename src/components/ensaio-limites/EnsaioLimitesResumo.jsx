import React from 'react';

const sectionHeader = 'bg-muted/10 text-foreground text-center font-bold text-xs py-1 border border-border/20 mb-2 rounded';

export function ResumoSection({
  pctPedregulho, pctAreiaGrossaMedia, pctAreiaFina, pctSilteArgila,
  llFit, lpMedia, IP, igCalc, classificacaoHRB
}) {
  return (
    <div className="mt-4">
      <div className={sectionHeader}>RESUMO</div>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[10px]">
        <tbody>
          {[
            { label: 'Pedregulho', value: pctPedregulho != null ? `${pctPedregulho}%` : '-' },
            { label: 'Areia Grossa e Média', value: pctAreiaGrossaMedia != null ? `${pctAreiaGrossaMedia}%` : '-' },
            { label: 'Areia Fina', value: pctAreiaFina != null ? `${pctAreiaFina}%` : '-' },
            { label: 'Silte+Argila (Passante na #200)', value: pctSilteArgila != null ? `${pctSilteArgila}%` : '-' },
            { label: 'Limite de Liquidez', value: llFit?.ll != null ? `${llFit.ll}%` : '-', highlight: true },
            { label: 'Limite de Plasticidade', value: lpMedia != null ? `${lpMedia}%` : '0,0', highlight: true },
            { label: 'Índice de Plasticidade', value: IP != null ? `${IP}%` : '-', highlight: true },
            { label: 'Índice de Grupo (IG)', value: igCalc != null ? `${igCalc}` : '-' },
            { label: 'Classificação HRB', value: classificacaoHRB },
          ].map(row => (
            <tr key={row.label} className={row.highlight ? 'bg-secondary/20/20' : 'bg-card/10'}>
              <td className="border border-border/20 px-2 py-1.5 font-medium text-foreground w-3/4">{row.label}</td>
              <td className="border border-border/20 px-2 py-1.5 text-center font-bold text-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}