import React, { useMemo, useCallback } from "react";
import { AlertTriangle, FileText, Grid, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ACCESS_LEVELS } from "@/lib/layoutConstants";
import { createPageUrl } from "@/utils";
import { ENSAIOS_POR_TIPO_OBRA, DIARIO_OBRA } from "./NavigationConfig";

// "Controle de Execução de Serviços" fica disponível para quem cria registros
// de gerenciamento (gestor/admin/sala técnica). Exibido no "Registro Geral"
// para não ficar preso à categoria "Gerenciamento", que só aparece quando o
// usuário possui obras daquele tipo — sem isso, gestores sem obra de
// gerenciamento alocada não conseguem acessar o formulário.
const CONTROLE_EXECUCAO = {
  title: "Controle de Execução de Serviços",
  url: createPageUrl("ControleExecucaoServicos"),
  icon: ClipboardList,
  description: "Controle de serviços executados",
};
const CONTROLE_EXECUCAO_LEVELS = [
  ACCESS_LEVELS.ADMIN,
  ACCESS_LEVELS.GESTOR_CONTRATO,
  ACCESS_LEVELS.SALA_TECNICA,
];

const CARD_STYLE = "bg-card border-border";

const EnsaioButton = ({ ensaio, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(ensaio.url)}
    className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted hover:border-primary/40 transition-all duration-200 text-left"
  >
    <ensaio.icon className="w-5 h-5 text-primary" />
    <p className="font-medium text-foreground text-sm">{ensaio.title}</p>
  </button>
);

const CategoriaCard = ({ categoria, onSelect }) => (
  <div className={`border-2 rounded-lg p-4 ${CARD_STYLE}`}>
    <div className="flex items-center gap-2 mb-3">
      <categoria.icon className="w-5 h-5 text-primary" />
      <h4 className="font-bold text-foreground">{categoria.nome}</h4>
    </div>

    {categoria.setores ? (
      <div className="space-y-3">
        {categoria.setores.map((setor) => (
          <div key={setor.nome}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">{setor.nome}</p>
            <div className="grid grid-cols-1 gap-1.5">
              {setor.ensaios.map((ensaio) => (
                <EnsaioButton key={ensaio.title} ensaio={ensaio} onSelect={onSelect} />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : categoria.ensaios?.length > 0 ? (
      <div className="grid grid-cols-1 gap-2">
        {categoria.ensaios.map((ensaio) => (
          <EnsaioButton key={ensaio.title} ensaio={ensaio} onSelect={onSelect} />
        ))}
      </div>
    ) : (
      <div className="text-center py-6 px-4 bg-muted/50 rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground italic">
          Ensaios específicos para {categoria.nome.toLowerCase()} serão adicionados em breve
        </p>
      </div>
    )}
  </div>
);

const CreateEnsaioDialog = React.memo(({ onSelect, user, obrasDoUsuario }) => {
  const tiposObraDisponiveis = useMemo(() => {
    if (!obrasDoUsuario?.length) return new Set();
    return new Set(obrasDoUsuario.map(o => o.tipo_obra).filter(Boolean));
  }, [obrasDoUsuario]);

  const categoriasDisponiveis = useMemo(
    () => ENSAIOS_POR_TIPO_OBRA.filter(c => tiposObraDisponiveis.has(c.tipo_obra)),
    [tiposObraDisponiveis]
  );

  // Não navega diretamente: entrega a URL ao Layout, que fecha o diálogo
  // primeiro e só navega após o portal do Radix terminar de fechar.
  // Navegar aqui desmontava o Layout inteiro (cada rota tem sua própria
  // instância de Layout) com o diálogo ainda aberto, causando
  // "Failed to execute 'removeChild' on 'Node'".
  const handleSelect = useCallback((url) => {
    onSelect(url);
  }, [onSelect]);

  if ((user?.access_level === ACCESS_LEVELS.USER || user?.access_level === ACCESS_LEVELS.FUNCIONARIOS_CLIENTE) && obrasDoUsuario?.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma obra disponível</h3>
        <p className="text-muted-foreground">Você não está alocado em nenhuma obra no momento. Entre em contato com o administrador.</p>
      </div>
    );
  }

  const userAccessLevel = user?.access_level;
  const showControleExecucao = CONTROLE_EXECUCAO_LEVELS.includes(userAccessLevel);

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Registro Geral
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelect(DIARIO_OBRA.url)}
            className="w-full flex items-center gap-4 p-4 border-2 rounded-lg bg-card hover:bg-muted transition-colors duration-200 text-left border-border hover:border-primary/50"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <DIARIO_OBRA.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{DIARIO_OBRA.title}</p>
              <p className="text-sm text-muted-foreground">{DIARIO_OBRA.description}</p>
            </div>
          </button>

          {showControleExecucao && (
            <button
              type="button"
              onClick={() => handleSelect(CONTROLE_EXECUCAO.url)}
              className="w-full flex items-center gap-4 p-4 border-2 rounded-lg bg-card hover:bg-muted transition-colors duration-200 text-left border-border hover:border-primary/50"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <CONTROLE_EXECUCAO.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{CONTROLE_EXECUCAO.title}</p>
                <p className="text-sm text-muted-foreground">{CONTROLE_EXECUCAO.description}</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {categoriasDisponiveis.length > 0 && (
        <>
          <Separator className="bg-border" />
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Grid className="w-4 h-4 text-primary" />
              Ensaios por Tipo de Obra
            </h3>
            {categoriasDisponiveis.map((categoria) => (
              <CategoriaCard key={categoria.nome} categoria={categoria} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}

      {categoriasDisponiveis.length === 0 && (!user || (user.access_level !== "user" && user.access_level !== "funcionarios_cliente") || obrasDoUsuario?.length > 0) && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum tipo de ensaio disponível para as obras alocadas.</p>
        </div>
      )}
    </div>
  );
});

CreateEnsaioDialog.displayName = "CreateEnsaioDialog";
export default CreateEnsaioDialog;