import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useResumosData } from "./hooks/useResumosData";
import FiltrosCard from "./components/FiltrosCard";
import ResultadosTable, { EmptyState } from "./components/ResultadosTable";
import { normalizarTexto } from "./utils/resumosUtils";
import { toast } from "@/components/ui/use-toast";

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
    if (dadosConsolidados.length === 0) { toast({ title: "Nenhum dado para exportar.", variant: "destructive" }); return; }
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

  const exportarVigaBenkelman = async (linhaId) => {
    const ensaio = rawEnsaios.find(e => e.id === linhaId || linhaId?.startsWith(e.id));
    if (!ensaio) return;
    const levantamentos = ensaio.levantamentos || [];
    if (levantamentos.length === 0) { toast({ title: 'Este ensaio não possui levantamentos.', variant: "destructive" }); return; }
    const wsData = [
      ['Laboratorista', ensaio.laboratorista_name || '-'],
      ['Data', ensaio.data_ensaio ? new Date(ensaio.data_ensaio).toLocaleDateString('pt-BR') : '-'],
      ['Rodovia', ensaio.rodovia || '-'],
      ['Trecho', ensaio.trecho || '-'],
      ['Def. Admissível (x10⁻²mm)', ensaio.def_admissivel ?? '-'],
      [],
      ['Faixa', 'Local (Estaca/KM)', 'Posição', 'Leitura Inicial (A)', 'Leitura Final (B)', 'Diferença (C = A - B)', 'Deflexão (x10⁻²mm)'],
      ...levantamentos.flatMap(l => [
        [l.faixa_nome || '-', l.estaca_km || '-', 'Bordo Esquerdo', l.bordo_esquerdo?.leitura_inicial ?? '-', l.bordo_esquerdo?.leitura_final ?? '-', l.bordo_esquerdo?.diferenca ?? '-', l.bordo_esquerdo?.deflexao ?? '-'],
        [l.faixa_nome || '-', l.estaca_km || '-', 'Eixo', l.eixo?.leitura_inicial ?? '-', l.eixo?.leitura_final ?? '-', l.eixo?.diferenca ?? '-', l.eixo?.deflexao ?? '-'],
        [l.faixa_nome || '-', l.estaca_km || '-', 'Bordo Direito', l.bordo_direito?.leitura_inicial ?? '-', l.bordo_direito?.leitura_final ?? '-', l.bordo_direito?.diferenca ?? '-', l.bordo_direito?.deflexao ?? '-'],
      ])
    ];
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Estilizar header (linha 7 = índice 6) com verde-oliva do sistema
    const headerCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    headerCols.forEach(col => {
      const ref = `${col}7`;
      if (ws[ref]) {
        ws[ref].s = {
          fill: { fgColor: { rgb: "BFCF99" } },
          font: { bold: true, color: { rgb: "00233B" } },
          alignment: { horizontal: 'center' }
        };
      }
    });
    // Estilizar labels de metadata (coluna A, linhas 1-5) em negrito
    ['A1', 'A2', 'A3', 'A4', 'A5'].forEach(ref => {
      if (ws[ref]) {
        ws[ref].s = { font: { bold: true, color: { rgb: "00233B" } } };
      }
    });
    ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Levantamentos');
    const dataStr = ensaio.data_ensaio ? new Date(ensaio.data_ensaio).toLocaleDateString('pt-BR') : '';
    XLSX.writeFile(wb, `viga_benkelman_${dataStr}.xlsx`);
  };

  const exportarMedicaoGeometrica = async (linhaId) => {
    const ensaio = rawEnsaios.find(e => e.id === linhaId || linhaId?.startsWith(e.id));
    if (!ensaio) return;
    const med = ensaio.medicoes_geometricas;
    const medicoes = med?.medicoes || [];
    if (medicoes.length === 0) { toast({ title: 'Este checklist não possui medições geométricas.', variant: "destructive" }); return; }
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
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Medição Geométrica');
    const dataStr = ensaio.data ? new Date(ensaio.data).toLocaleDateString('pt-BR') : '';
    XLSX.writeFile(wb, `medicao_geometrica_${dataStr}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resumos</h1>
          <p className="text-muted-foreground mt-1">
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
          onExportarVigaBenkelman={exportarVigaBenkelman}
        />

        {dadosConsolidados.length === 0 && !loadingData && (
          <EmptyState tipoEnsaioSelecionado={tipoEnsaioSelecionado} obraId={obraId} />
        )}
      </div>
    </div>
  );
}