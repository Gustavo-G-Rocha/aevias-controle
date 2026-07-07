// Interface de visualização para laboratoristas (cards por status)
import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ensaios/Pagination";
import EnsaioCard from "./EnsaioCard";

// P5 — paginação client-side: limita os cards renderizados por aba (~12),
// evitando lag com dezenas/centenas de registros. Mesmo padrão já usado
// pelo AdminInterface (useTableFilters + Pagination).
const ITEMS_PER_PAGE = 12;

const LaboratoristaInterface = React.memo(({ ensaios, obras, user, allUsers }) => {
  const [activeTab, setActiveTab] = useState('emExecucao');
  const [currentPage, setCurrentPage] = useState(1);

  // O(1) lookup — evita obras.find() dentro dos três .map() das tabs
  const obrasMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);

  const emExecucao = useMemo(() =>
    ensaios.filter((e) => (e.status === 'rascunho' || e.approved === false) && !e.client_signature?.signed_by),
    [ensaios]
  );

  const pendentes = useMemo(() =>
    ensaios.filter((e) => {
      const isFinalizadoOuSemStatus = e.status === 'finalizado' || (!e.status && e.status !== 'rascunho');
      return isFinalizadoOuSemStatus && e.approved === null && !e.client_signature?.signed_by && e.approved !== false;
    }),
    [ensaios]
  );

  const aprovados = useMemo(() =>
    ensaios.filter((e) => e.approved === true || e.client_signature?.signed_by),
    [ensaios]
  );

  // P5 — fatia apenas a página atual de cada aba (o resto fica fora do DOM).
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExecucao = useMemo(() => emExecucao.slice(pageStart, pageStart + ITEMS_PER_PAGE), [emExecucao, pageStart]);
  const paginatedPendentes = useMemo(() => pendentes.slice(pageStart, pageStart + ITEMS_PER_PAGE), [pendentes, pageStart]);
  const paginatedAprovados = useMemo(() => aprovados.slice(pageStart, pageStart + ITEMS_PER_PAGE), [aprovados, pageStart]);
  const totalPagesExecucao = Math.ceil(emExecucao.length / ITEMS_PER_PAGE);
  const totalPagesPendentes = Math.ceil(pendentes.length / ITEMS_PER_PAGE);
  const totalPagesAprovados = Math.ceil(aprovados.length / ITEMS_PER_PAGE);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const triggerClass = "data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-secondary text-muted-foreground hover:bg-muted/50 flex flex-col items-center gap-0.5 py-2 px-1";

  const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Icon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p>{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 border border-border h-auto">
          <TabsTrigger value="emExecucao" className={triggerClass}>
            <span className="text-xs leading-tight text-center">Em Execução</span>
            <Badge className="text-xs">{emExecucao.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pendentes" className={triggerClass}>
            <span className="text-xs leading-tight text-center">Pendentes</span>
            <Badge className="text-xs">{pendentes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="aprovados" className={triggerClass}>
            <span className="text-xs leading-tight text-center">Aprovados</span>
            <Badge className="text-xs">{aprovados.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emExecucao" className="mt-4 space-y-4">
          {emExecucao.length > 0
            ? (<>
                {paginatedExecucao.map((ensaio) => <EnsaioCard key={ensaio.id} ensaio={ensaio} obra={obrasMap.get(ensaio.obra_id)} user={user} allUsers={allUsers} />)}
                <Pagination currentPage={currentPage} totalPages={totalPagesExecucao} onPageChange={setCurrentPage} />
              </>)
            : <EmptyState icon={FileText} title="Nenhum registro em execução" subtitle="Comece criando um novo registro ou finalize os em rascunho." />
          }
        </TabsContent>

        <TabsContent value="pendentes" className="mt-4 space-y-4">
          {pendentes.length > 0
            ? (<>
                {paginatedPendentes.map((ensaio) => <EnsaioCard key={ensaio.id} ensaio={ensaio} obra={obrasMap.get(ensaio.obra_id)} user={user} allUsers={allUsers} />)}
                <Pagination currentPage={currentPage} totalPages={totalPagesPendentes} onPageChange={setCurrentPage} />
              </>)
            : <EmptyState icon={FileText} title="Nenhum registro pendente" subtitle="Todos os ensaios e diários estão aprovados ou não há registros." />
          }
        </TabsContent>

        <TabsContent value="aprovados" className="mt-4 space-y-4">
          {aprovados.length > 0
            ? (<>
                {paginatedAprovados.map((ensaio) => <EnsaioCard key={ensaio.id} ensaio={ensaio} obra={obrasMap.get(ensaio.obra_id)} user={user} allUsers={allUsers} />)}
                <Pagination currentPage={currentPage} totalPages={totalPagesAprovados} onPageChange={setCurrentPage} />
              </>)
            : <EmptyState icon={CheckCircle} title="Nenhum registro aprovado ainda" subtitle="Aguarde a aprovação dos ensaios pelo administrador." />
          }
        </TabsContent>
      </Tabs>
    </div>
  );
});

LaboratoristaInterface.displayName = 'LaboratoristaInterface';
export default LaboratoristaInterface;