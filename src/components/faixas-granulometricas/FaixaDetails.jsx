import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIPO_CORES, STATUS_CORES } from "@/utils/faixasGranulometricasUtils";

const FaixaDetails = React.memo(({ faixa }) => {
  const statusColors = useMemo(() => STATUS_CORES, []);
  const tipoColors = useMemo(() => TIPO_CORES, []);

  return (
    <div className="space-y-6 text-[#00233B]">
      <Card className="bg-[#F2F1EF]/80 backdrop-blur-lg border-white/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl text-[#00233B]">{faixa.nome}</CardTitle>
              <Badge className={tipoColors[faixa.tipo || 'CAUQ']}>
                {faixa.tipo || 'CAUQ'}
              </Badge>
            </div>
            <Badge className={statusColors[faixa.status] || statusColors.ativo}>
              {faixa.status || 'ativo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-[#00233B]/60">Especificação</p>
              <p className="text-[#00233B]">{faixa.especificacao}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#00233B]/60">Órgão</p>
              <p className="text-[#00233B]">{faixa.orgao}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#F2F1EF]/80 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-[#00233B]">Faixa Granulométrica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-white/20">
              <thead className="bg-black/5">
                <tr>
                  <th scope="col" className="border border-white/10 px-4 py-2 text-left text-sm font-medium text-[#00233B]/70">
                    Peneira ASTM
                  </th>
                  <th scope="col" className="border border-white/10 px-4 py-2 text-left text-sm font-medium text-[#00233B]/70">
                    Abertura
                  </th>
                  <th scope="col" className="border border-white/10 px-4 py-2 text-center text-sm font-medium text-[#00233B]/70">
                    Mínimo (%)
                  </th>
                  <th scope="col" className="border border-white/10 px-4 py-2 text-center text-sm font-medium text-[#00233B]/70">
                    Máximo (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {faixa.peneiras?.map((peneira, index) => (
                  <tr key={index} className="hover:bg-black/5">
                    <td className="border border-white/10 px-4 py-2 text-sm text-[#00233B] font-medium">
                      {peneira.astm}
                    </td>
                    <td className="border border-white/10 px-4 py-2 text-sm text-[#00233B]">
                      {peneira.abertura}
                    </td>
                    <td className="border border-white/10 px-4 py-2 text-sm text-[#00233B] text-center">
                      {peneira.min}%
                    </td>
                    <td className="border border-white/10 px-4 py-2 text-sm text-[#00233B] text-center">
                      {peneira.max}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

FaixaDetails.displayName = 'FaixaDetails';
export default FaixaDetails;