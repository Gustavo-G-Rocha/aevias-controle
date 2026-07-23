import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AprovacaoBar from '@/components/relatorios/AprovacaoBar';
import RelatorioTaxaInsumosDoc from '@/components/relatorios/RelatorioTaxaInsumosDoc';

export default function RelatorioTaxaInsumos() {
  const navigate = useNavigate();
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
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="h-8 gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </Button>
            <h2 className="text-lg font-semibold text-slate-800">
              Relatório de Taxa de Insumos
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AprovacaoBar entityName="EnsaioTaxaInsumos" recordId={ensaio.id} />
            <Button onClick={() => window.print()} className="bg-slate-800 text-white hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </div>
      <RelatorioTaxaInsumosDoc ensaio={ensaio} obra={obra} regional={regional} />
    </div>
  );
}