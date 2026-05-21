import { useMemo } from "react";
import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";
import { useResumosData } from "./hooks/useResumosData";
import FiltrosCard from "./components/FiltrosCard";
import ResultadosTable, { EmptyState } from "./components/ResultadosTable";
import { normalizarTexto } from "./utils/resumosUtils";

export default function ResumosPersonalizadosPage() {
  const {
    obras, regionais, loading, loadingData,
    obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro,
    dadosConsolidados, laboratoristas, rawEnsaios,
    setDataInicio, setDataFim, setLaboratoristaFiltro,
    handleObraChange, handleTipoEnsaioChange, carregarDados,
  } = useResumosData();

  const obraSelecionada = useMemo(() => obras.find(o => o.id === obraId), [obras, obraId]);

  const exportarParaCSV = () => {
    if (dadosConsolidados.length === 0) { alert("Nenhum dado para exportar."); return; }
    const headers = Object.keys(dadosConsolidados[0]);
    const csvContent = [
      headers.map(h => normalizarTexto(h)).join(';'),
      ...dadosConsolidados.map(row => headers.map(h => normalizarTexto(String(row[h] || ''))).join(';'))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resumo_personalizado_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportarMedicaoGeometrica = (linhaId) => {
    const ensaio = rawEnsaios.find(e => e.id === linhaId || linhaId?.startsWith(e.id));
    if (!ensaio) return;
    const med = ensaio.medicoes_geometricas;
    const medicoes = med?.medicoes || [];
    if (medicoes.length === 0) { alert('Este checklist não possui medições geométricas.'); return; }
    const wsData = [
      ['Subtrecho', med.subtrecho || '-'],
      ['Serviço', med.servico || '-'],
      [],
      ['Estaca Inicial', 'Estaca Final', 'Lado', 'Faixa', 'Comprimento (m)', 'Largura (m)', 'Altura (cm)', 'Placa', 'Quantidade', 'Temperatura (°C)', 'Observações'],
      ...medicoes.map(m => [
        m.estaca_inicial || '-', m.estaca_final || '-', m.lado || '-', m.faixa || '-',
        m.comprimento ?? '-', m.largura ?? '-', m.altura ?? '-', m.placa || '-',
        m.quantidade ?? '-', m.temperatura ?? '-', m.observacoes || '-'
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medição Geométrica');
    const dataStr = ensaio.data ? new Date(ensaio.data).toLocaleDateString('pt-BR') : '';
    XLSX.writeFile(wb, `medicao_geometrica_${dataStr}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#00233B]">Resumos</h1>
          <p className="text-[#00233B]/80 mt-1">
            Selecione os ensaios, período e campos para gerar relatórios consolidados
          </p>
        </div>

        <FiltrosCard
          obras={obras}
          regionais={regionais}
          obraId={obraId}
          tipoEnsaioSelecionado={tipoEnsaioSelecionado}
          dataInicio={dataInicio}
          dataFim={dataFim}
          laboratoristaFiltro={laboratoristaFiltro}
          laboratoristas={laboratoristas}
          loadingData={loadingData}
          temDados={dadosConsolidados.length > 0}
          onObraChange={handleObraChange}
          onTipoChange={handleTipoEnsaioChange}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          onLaboratoristaChange={setLaboratoristaFiltro}
          onGerarResumo={carregarDados}
          onExportarCSV={exportarParaCSV}
        />

        <ResultadosTable
          dadosConsolidados={dadosConsolidados}
          tipoEnsaioSelecionado={tipoEnsaioSelecionado}
          obraSelecionada={obraSelecionada}
          onExportarMedicaoGeometrica={exportarMedicaoGeometrica}
        />

        {dadosConsolidados.length === 0 && !loadingData && (
          <EmptyState tipoEnsaioSelecionado={tipoEnsaioSelecionado} obraId={obraId} />
        )}
      </div>
    </div>
  );
}