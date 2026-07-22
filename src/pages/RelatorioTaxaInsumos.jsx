import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RelatorioTaxaInsumosDoc from '@/components/relatorios/RelatorioTaxaInsumosDoc';

export default function RelatorioTaxaInsumos() {
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { setLoading(false); return; }

    base44.entities.EnsaioTaxaInsumos.get(id)
      .then(async (data) => {
        setEnsaio(data);
        if (data.obra_id) {
          const obraData = await base44.entities.Obra.get(data.obra_id);
          setObra(obraData);
          if (obraData?.regional_id) {
            const reg = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(reg);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ensaio) {
    return <div className="p-8 text-center text-muted-foreground">Ensaio não encontrado.</div>;
  }

  return (
    <div className="report-scope">
      <div className="print:hidden flex justify-end p-4 gap-2">
        <Button onClick={() => window.print()} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>
      <RelatorioTaxaInsumosDoc ensaio={ensaio} obra={obra} regional={regional} />
    </div>
  );
}