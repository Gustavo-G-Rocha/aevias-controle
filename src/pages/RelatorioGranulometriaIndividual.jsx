import React, { useEffect, useState } from "react";
import { useReportMode } from "@/hooks/useReportMode";
import { useLocation } from "react-router-dom";
import { obterEnsaioById } from "@/services/ensaiosService";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { obterObraById } from "@/services/obrasService";
import { obterRegionalById } from "@/services/regionaisService";
import { obterProjectById } from "@/services/projectsService";
import RelatorioGranulometriaIndividual from "../components/relatorios/RelatorioGranulometriaIndividual";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Printer, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import AprovacaoBar from '../components/relatorios/AprovacaoBar';
import { canUserEditRecord } from "@/utils/recordEditPermission";
import { toast } from "@/components/ui/use-toast";
import { useReportPdfActions } from '@/hooks/useReportPdfActions';
import { logger } from '@/utils/logger';

export default function RelatorioGranulometriaIndividualPage() {
  useReportMode();
  const [ensaio, setEnsaio] = useState(null);
  const [obra, setObra] = useState(null);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [regional, setRegional] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const ensaioId = params.get("id");

        if (!ensaioId) {
          toast({ title: "ID do ensaio não fornecido.", variant: "destructive" });
          return;
        }

        const ensaioData = await obterEnsaioById('EnsaioGranulometriaIndividual', ensaioId);
        setEnsaio(ensaioData);

        // Dados secundários — falha isolada não bloqueia o relatório
        const currentUser = await obterUsuarioAtual().catch(() => null);
        setUser(currentUser);

        if (ensaioData.obra_id) {
          const obraData = await obterObraById(ensaioData.obra_id).catch(() => null);
          setObra(obraData);

          if (obraData?.regional_id) {
            const regionalData = await obterRegionalById(obraData.regional_id).catch(() => null);
            setRegional(regionalData);
          }
        }

        if (ensaioData.project_id) {
          const projectData = await obterProjectById(ensaioData.project_id).catch(() => null);
          setProject(projectData);
        }
      } catch (error) {
        logger.error("Erro ao carregar dados:", error);
        toast({ title: "Erro ao carregar o relatório.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.search]);

  // No PC abre "Salvar como"; no celular baixa direto.
  const { handlePrint, downloading } = useReportPdfActions('relatorio-granulometria-individual.pdf');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isCliente = user?.access_level === 'cliente' || user?.access_level === 'cliente_supervisor';
  const podeEditar = !!ensaio && !isCliente &&
    (ensaio.status === 'rascunho' || ensaio.approved === false) &&
    !ensaio.client_signature?.signed_by &&
    canUserEditRecord(user, ensaio, obra, regional ? [regional] : []);

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="max-w-[210mm] mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Relatório de Granulometria Individual</h2>
          <div className="flex items-center gap-2">
            {podeEditar && (
              <Button asChild variant="outline">
                <Link to={createPageUrl(`EnsaioGranulometriaIndividual?editId=${ensaio.id}`)}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Link>
              </Button>
            )}
            {ensaio && <AprovacaoBar entityName="EnsaioGranulometriaIndividual" recordId={ensaio.id} />}
            <Button onClick={handlePrint} disabled={downloading} className="bg-slate-800 text-white hover:bg-slate-700">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
              {downloading ? 'Gerando...' : 'Imprimir'}
            </Button>
          </div>
        </div>
      </div>
      <div className="report-content-container">
        <RelatorioGranulometriaIndividual
          ensaio={ensaio}
          obra={obra}
          project={project}
          user={user}
          regional={regional}
        />
      </div>
    </div>
  );
}