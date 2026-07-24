# ESPECIFICAÇÃO COMPLETA DO SISTEMA — Afirma Evias (Controle Tecnológico de Obras Rodoviárias)

> Documento de referência para reconstrução do sistema do zero.
> Cobre: visão geral, perfis de usuário e regras de acesso, todas as telas, todas as tabelas do banco (com campos e RLS), ciclo de vida dos registros, segurança (2FA, assinatura eletrônica, auditoria), funções de backend, workflows e arquitetura offline.

---

## 1. VISÃO GERAL

Sistema de **controle tecnológico de obras rodoviárias** usado por uma empresa de engenharia consultiva (Afirma Evias). Laboratoristas em campo/usina preenchem **ensaios de laboratório, checklists de execução, boletins de sondagem e diários de obra** pelo celular (com suporte offline). Gestores e clientes (concessionárias/órgãos) **revisam, aprovam e assinam eletronicamente** os registros, que viram **relatórios técnicos imprimíveis em A4** com QR Code de verificação de autenticidade.

**Domínios principais:**
1. **Cadastro estrutural**: Regionais → Obras → Projetos (traços/dosagens) → Usuários alocados.
2. **Registros de campo**: ~25 tipos de ensaios/checklists/boletins/diários.
3. **Fluxo de aprovação**: rascunho → finalizado → aprovado/reprovado (gestor) → assinado (cliente).
4. **Relatórios**: 1 relatório A4 imprimível por tipo de registro + Relatório Consolidado Regional (unificado por período).
5. **Não Conformidades (NC)**: registradas dentro dos checklists/diários ou avulsas, com gestão própria.
6. **Segurança/Compliance**: assinatura eletrônica (Lei 14.063/2020), 2FA TOTP, trilha de auditoria com hash encadeado, verificação pública de assinatura por QR Code.
7. **Produtividade**: monitoramento de dias trabalhados dos laboratoristas.
8. **Offline-first**: registros podem ser criados/editados sem internet e sincronizados depois.

**Stack atual:** React 18 + Vite + Tailwind + shadcn/ui, React Router 6, TanStack Query, Base44 BaaS (auth, banco por entidades JSON com RLS, funções serverless Deno, workflows). Publicável como PWA e app mobile.

---

## 2. PERFIS DE USUÁRIO E REGRAS DE ACESSO

### 2.1 Níveis de acesso (campo `access_level` do usuário)

| Nível | Nome exibido | Descrição |
|---|---|---|
| `admin` | Administrador | Acesso total. Gerencia usuários, faixas, migrações, monitor. |
| `sala_tecnica_afirmaevias` | Sala Técnica | Equipe técnica interna. Aprova registros, gerencia regionais/obras/projetos, cria faixas granulométricas. |
| `gestor_contrato` | Gestor de Contrato | Responsável por regionais específicas. Aprova registros das suas regionais. |
| `user` | Laboratorista | Cria registros de campo nas obras onde está alocado. Vê apenas os próprios registros. |
| `funcionarios_cliente` | Funcionário do Cliente | Comporta-se como laboratorista (cria registros), mas pertence ao cliente. Vinculado a um `supervisor_email`. |
| `cliente` | Cliente | Visualiza registros das suas regionais e **assina** (engenheiro). Não aprova. |
| `cliente_supervisor` | Cliente Supervisor | Como cliente, mas **pode aprovar/reprovar** se seu email estiver em `supervisores_responsaveis` da regional. |

### 2.2 Regras de normalização (arquivo `src/utils/accessControl.js`)

- `getUserAccessLevel(user)`: retorna `access_level`, ou `admin` se `role === 'admin'`, senão `user`.
- Nível efetivo: `cliente_supervisor` → comporta-se como `cliente`; `funcionarios_cliente` → comporta-se como `user`.
- **Quem aprova registros** (`isSupervisorInRegional`): `admin`, `sala_tecnica_afirmaevias` e `gestor_contrato` aprovam globalmente; `cliente_supervisor` aprova **somente** nas regionais onde seu email está em `supervisores_responsaveis`. `cliente` comum nunca aprova (só assina).
- **Quem assina como cliente**: `cliente`/`cliente_supervisor` com cargo contendo "engenheiro" (`isEngenheiroCliente`) — assinatura registra nome + CREA.
- **Visibilidade de regionais** (`filterRegionaisByUser`): cada regional tem listas de emails responsáveis por papel; o usuário só vê regionais onde seu email consta na lista do seu papel (laboratoristas_responsaveis, gestores_contrato_responsaveis, salas_tecnicas_responsaveis, clientes_responsaveis, supervisores_responsaveis). `funcionarios_cliente` herda acesso via `supervisor_email`. Admin vê tudo.
- **Visibilidade de registros**: laboratorista vê só o que criou (`created_by`); demais papéis veem os registros das obras das suas regionais.
- **Quem cria registros**: admin, sala técnica, user, funcionarios_cliente, cliente_supervisor.
- **Quem edita registro existente** (`src/utils/recordEditPermission.js`): criador ou admin; registro aprovado não é mais editável (reprovado volta a ser editável e marca `was_rejected`).

### 2.3 Padrão de RLS aplicado às entidades de registro (repetido em ~25 entidades)

```
create: admin | sala_tecnica | gestor_contrato | user | funcionarios_cliente
read:   null  (todos autenticados — o filtro fino é feito no frontend/backend por regional/created_by)
update: criador (created_by = email) | admin
delete: criador | admin | sala_tecnica | gestor_contrato
```
Entidades de segurança (AssinaturaEletronica, AuditTrail) são **append-only**: `create: false` (só via service role no backend), update/delete bloqueados por condição impossível (`role: "__append_only__"`).

---

## 3. TABELA DO BANCO: User (usuário built-in + campos customizados)

Campos built-in: `id`, `email`, `full_name`, `role` (`admin`/`user`), `created_date`.

Campos customizados (`base44/entities/User.jsonc`):

| Campo | Tipo | Uso |
|---|---|---|
| `nickname` | string | Apelido exibido no Dashboard |
| `company` | string | Empresa |
| `phone` | string | Telefone |
| `position` | string | Cargo — usado para detectar "engenheiro" (assinatura de cliente) |
| `crea_number` | string | CREA — impresso nas assinaturas dos relatórios |
| `laboratorista_name` | string (obrigatório) | Nome completo para assinatura nos ensaios |
| `is_active` | boolean (default true) | Desativação lógica de usuário |
| `access_level` | enum (7 níveis, ver §2.1, default `user`) | Nível funcional |
| `supervisor_email` | string | Para `funcionarios_cliente`: email do supervisor responsável |
| `last_login` | datetime | Atualizado pela função `updateLastLogin` |

RLS: read liberado a autenticados; write apenas admin, sala técnica, gestor de contrato e cliente_supervisor.

Onde é usado: página Users (CRUD/convites), Dashboard (nickname), assinaturas de todos os relatórios, aprovações (approver_details), controle de laboratoristas, produtividade.

---

## 4. ESTRUTURA DE NAVEGAÇÃO E LAYOUT

### 4.1 Autenticação (rotas públicas)
- `/login` — email+senha, Google, link "esqueci a senha". Após login: gate de 2FA (`TwoFactorGate`) se o usuário tem TOTP ativo.
- `/register` — registro → OTP por email → verificação → sessão.
- `/forgot-password`, `/reset-password?token=` — fluxo de redefinição.
- `/verificar-assinatura` — **pública**: valida autenticidade de um documento assinado (via QR Code impresso no relatório; chama a função `verificarAssinatura`).

Extras de sessão: timeout por inatividade com aviso (`useSessionTimeout` + `SessionTimeoutWarning`), auditoria de login/logout.

### 4.2 Layout (`src/Layout.jsx`)
- **Sidebar** (desktop) / **BottomNav + Sheet** (mobile), tema navy `#00233B` + verde-oliva `#BFCF99`, dark mode por classe com tokens CSS em `src/index.css`.
- Botão central **"Iniciar Novo Registro"** abre diálogo (`CreateEnsaioDialog`) que lista os tipos de registro **conforme o tipo da obra selecionada** (mapa em `NavigationConfig.jsx` — ver §4.4).
- Páginas de **relatório** não usam sidebar: são envolvidas em `.report-scope` (fundo branco fixo, mesmo em dark mode, otimizado para impressão A4 via `@media print`).
- Pull-to-refresh no mobile (desabilitado em páginas de formulário), barra de status offline, tratamento do botão "voltar" do Android.

### 4.3 Menu principal (por nível de acesso — `NavigationConfig.jsx`)

| Item | Rota | Níveis |
|---|---|---|
| Dashboard | `/Dashboard` (rota `/` = mainPage) | admin, gestor, sala técnica, cliente, cliente_supervisor |
| Regionais | `/Regionais` | todos |
| Relatório Consolidado Regional | `/RelatoriosUnificados` | admin, gestor, sala técnica |
| Meus Ensaios (registros) | `/MeusEnsaios` | todos |
| Diário de Obra | `/DiarioObra` | criadores de registro |
| Usuários | `/Users` | admin, gestor, sala técnica, cliente, cliente_supervisor |
| Produtividade | `/Produtividade` | admin, gestor, sala técnica |
| Controle Laboratoristas | `/ControleLaboratoristas` | admin |
| Faixas Granulométricas | `/FaixasGranulometricas` | admin |
| Migração de Dados | `/MigracaoDados` | admin |
| Monitor de Produtividade | `/MonitorProdutividade` | admin |
| Configurações | `/Settings` | todos |
| Reportar Erros | `/ReportarErro` | todos |
| Solicitações de Transferência | `/SolicitacoesTransferencia` | admin, gestor, sala técnica (badge com pendências) |
| Não Conformidades / Gestão NC | `/NaoConformidades`, `/GestaoNC` | conforme papel |

### 4.4 Tipos de registro por tipo de obra (regra de negócio central)

Cada **Obra** tem um `tipo_obra` que define quais formulários aparecem no diálogo "Iniciar Novo Registro":

| Tipo de obra | Registros disponíveis |
|---|---|
| **Supervisão** | Checklists: Usina, Aplicação, MRAF, Concretagem, Terraplanagem, Reciclagem; Ensaios: CAUQ, Acompanhamento de Usinagem, Taxa Pintura/Imprimação, Rompimento Concreto, Mancha+Pêndulo, Sondagem, Viga Benkelman, Taxa MRAF |
| **Gerenciamento** | Controle de Execução de Serviços |
| **Implantação** | Ensaio MRAF, Acomp. Usinagem, Taxa Pintura/Imprimação, Granulometria Individual, Granulometria da Mistura, Rompimento Concreto, Mancha+Pêndulo, Densidade In Situ, Sondagem, Viga Benkelman, Taxa MRAF, Proctor, Taxa de Insumos |
| **Conservação** (dividida em setores Usina / MRAF / Campo) | Usina: CAUQ, Acomp. Usinagem, Rompimento, Gran. Individual, Gran. Mistura, Sondagem · MRAF: Ensaio MRAF, Taxa MRAF, Mancha+Pêndulo, Gran. Individual, Gran. Mistura · Campo: CAUQ, Taxa Pintura/Imprimação, Taxa de Insumos, Acompanhamento de Cargas, Viga Benkelman, Densidade In Situ, Proctor, Mancha+Pêndulo |
| **Sondagem** | Boletim de Sondagem (PI), Boletim de Sondagem a Trado, Ensaio Proctor |
| **Levantamentos** | Mancha+Pêndulo, Viga Benkelman |
| **Homologação de Usinas** | Certificação de Usina |

Diário de Obra está disponível para todas as obras.

---

## 5. TELAS — DETALHAMENTO

### 5.1 Dashboard (`/` e `/Dashboard`) — página inicial
- Saudação com nickname editável.
- KPIs: total de registros, pendentes, aprovados, reprovados (cards `DashboardStats`).
- Gráficos (recharts): registros por mês, por tipo, por obra (admin/cliente), pizza de status.
- Filtros por regional/obra/período (ocultos para laboratorista, que vê só os próprios dados).
- Dados agregados de **todas** as entidades de registro via `dashboardService` + `recordsService`.

### 5.2 Regionais (`/Regionais`)
- Lista de cards de **Regionais** (filtradas por papel — §2.2). Cada regional expande para suas **Obras**.
- CRUD de regional (admin/sala técnica/gestor): nome, código, cliente, estado, cidade, logo, listas de responsáveis por papel, projetos vinculados (`project_ids`), status ativa/inativa.
- CRUD de obra dentro da regional: nome, código, `tipo_obra`, status (planejamento/em_andamento/concluída/pausada), empreiteiras, clientes, usinas, rodovias, serviços.
- Laboratorista: vê suas regionais/obras e pode **solicitar transferência** de obra/regional (modais que criam `SolicitacaoTransferenciaObra`/`SolicitacaoTransferenciaRegional`).

### 5.3 Projetos (`/Projects`)
- CRUD de **Projetos técnicos** (traços/dosagens) vinculados a regionais: tipos CAUQ, MRAF, BGS, Concreto, Granular, com especificação, faixa granulométrica de trabalho, agregados, tabela Marshall, temperaturas, ligante, carta traço.
- Upload de PDF do projeto com **extração automática de dados** (função `extrairDadosProjeto` + LLM).
- Projetos alimentam os formulários de ensaio (ex.: EnsaioCAUQ puxa faixa de trabalho e parâmetros Marshall do projeto).

### 5.4 Meus Ensaios (`/MeusEnsaios`) — hub central de registros
- Interface distinta por papel:
  - **AdminInterface / interfaces de gestor**: tabela com todos os registros de todas as entidades, filtros (tipo, obra, regional, laboratorista, status, período), paginação, ações de aprovar/reprovar/excluir/exportar.
  - **ClienteInterface**: registros das regionais do cliente, ação de assinar (e aprovar, se supervisor).
  - **LaboratoristaInterface**: apenas registros próprios, cards agrupados por status (rascunho/pendente/aprovado/reprovado), botão editar enquanto não aprovado.
- FAB mobile "novo registro". Registro central em `ensaioMappers.jsx`: mapeia cada entidade → ícone, cor, rota do formulário, rota do relatório, campo de data, extração de NCs.
- Exportação em massa para PDF (função `exportarEnsaiosPDF`).

### 5.5 Formulários de registro (1 página por tipo)

Estrutura comum a todos: header com dados da obra (rodovia, trecho, data, laboratorista), seções específicas do ensaio, upload de fotos (com compressão), observações, seção "Ações Corretivas / Não Conformidades" (checklists e diário), botões **Salvar Rascunho** / **Finalizar** (com diálogo de confirmação de veracidade — `TruthConfirmationDialog`), banners de rascunho/reprovação. Edição via `?id=`. Todos suportam salvar offline.

| Rota | Registro | Entidade | Conteúdo específico |
|---|---|---|---|
| `/DiarioObra` | Diário de Obra | `DiarioObra` | Jornada, local (usina/campo), clima, temperatura, atividades, efetivo de máquinas (26 tipos) e colaboradores (17 funções), checklist de veículo (luzes, segurança, motor), NCs, fotos |
| `/ChecklistUsina` | Checklist de Usina | `ChecklistUsina` | Controle de agregados, equivalente de areia, rodadas de produção (até 4), controle CAUQ, controle de ligante (viscosidades, penetração, ponto de amolecimento/fulgor, recuperação elástica), medição de cargas da usina |
| `/ChecklistAplicacao` | Checklist de Aplicação | `ChecklistAplicacao` | Clima por período, fresagem, pintura de ligação, controle de aplicação, medições geométricas |
| `/ChecklistMRAF` | Checklist de MRAF | `ChecklistMRAF` | Condicionamento de insumos, preparação de superfície, acompanhamento/controle de aplicação |
| `/ChecklistConcretagem` | Checklist de Concretagem | `ChecklistConcretagem` | Cargas de concreto (slump, moldagem de CPs), clima |
| `/ChecklistTerraplanagem` | Checklist de Terraplanagem | `ChecklistTerraplanagem` | Material/origem, umidade ótima vs in situ, clima por período, acompanhamento de execução (sim/não/N.A. + tipos de rolo), ensaios da empreiteira (proctor, ISC, umidade, massa específica, granulometria, variação de umidade, grau de compactação) |
| `/ChecklistReciclagem` | Checklist de Reciclagem | `ChecklistReciclagem` | Acompanhamento de execução, ensaios da empreiteira, clima |
| `/EnsaioCAUQ` | Ensaio de CAUQ | `EnsaioCAUQ` | Extração de ligante, granulometria com faixa de trabalho do projeto, Marshall (densidades, vazios, RBV, estabilidade, RTCD), densidade Rice |
| `/EnsaioMRAF` | Ensaio MRAF | `EnsaioMRAF` | Extração de ligante, granulometria |
| `/EnsaioTaxaMRAF` | Taxa MRAF | `EnsaioTaxaMRAF` | Dimensões de bandeja, ensaios de taxa, resumo |
| `/EnsaioTaxaPinturaImprimacao` | Taxa Pintura/Imprimação | `EnsaioTaxaPinturaImprimacao` | Área da bandeja, taxas aplicadas, resíduo de emulsão (DNIT 145/2012) |
| `/EnsaioTaxaInsumos` | Taxa de Insumos | `EnsaioTaxaInsumos` | Tipo (cimento/agregado), bandeja (lados/área), até N ensaios (hora, camada, estaca, pesos, taxa), placa do caminhão |
| `/EnsaioManchaPendulo` | Mancha de Areia + Pêndulo Britânico | `EnsaioManchaPendulo` | Seções mancha, pêndulo, resultados (macro/microtextura), dados do cliente |
| `/EnsaioVigaBenkelman` | Viga Benkelman | `EnsaioVigaBenkelman` | Deflexões por estaca, resultados/gráfico |
| `/EnsaioSondagem` | Sondagem (rotativa/percussão) | `EnsaioSondagem` | Dados gerais, resultados por profundidade, fotos |
| `/BoletimSondagem` | Boletim de Sondagem (PI) | `BoletimSondagem` | Furo/pista/bordo/km, camadas com 2 classificações, umidade natural (2 ensaios, DNER-ME 213/94), densidades in situ (frasco de areia, DNER-ME 092/94), fotos |
| `/BoletimSondagemTrado` | Boletim de Sondagem a Trado | `BoletimSondagemTrado` | Igual ao PI com 1 classificação por camada |
| `/EnsaioProctor` | Ensaio Proctor + ISC/CBR | `EnsaioProctor` | Pontos de compactação, umidades, curva densidade×umidade, CBR/expansão |
| `/EnsaioDensidade` | Densidade (CPs asfalto) | `EnsaioDensidade` | Pesos do CP (seco/imerso/SSS), densidade máx. teórica, fator da prensa |
| `/EnsaioDensidadeInSitu` | Densidade In Situ | `EnsaioDensidadeInSitu` | Frasco de areia, grau de compactação |
| `/EnsaioGranulometriaIndividual` | Granulometria Individual | `EnsaioGranulometriaIndividual` | Agregados, peneiramento, equivalente de areia |
| `/GranuMistura` | Granulometria da Mistura | `GranuMistura` | Peneiramento da mistura, umidade, pulverulentos, equivalente de areia, faixa do projeto |
| `/EnsaioRompimentoConcreto` | Rompimento de Concreto | `EnsaioRompimentoConcreto` | CPs, idades, cargas de ruptura, fck |
| `/AcompanhamentoCarga` | Acompanhamento de Cargas | `AcompanhamentoCarga` | Até 20 cargas: ticket/NF, placa, horários (saída/chegada/aplicação), temperaturas (chegada/espalhamento/compactação), pista, espessura, estacas |
| `/AcompanhamentoUsinagem` | Acompanhamento de Usinagem | `AcompanhamentoUsinagem` | Cargas e agregados da usinagem |
| `/ControleExecucaoServicos` | Controle de Execução de Serviços | `ControleExecucaoServicos` | Serviços executados (estacas, comprimento, espessura, largura, quantidade, executora), fotos com legenda |
| `/CertificacaoUsina` | Certificação de Usina | `CertificacaoUsina` | Vistoria completa: aspectos legais (licenças), saúde/segurança, meio ambiente (ruídos, emissões, efluentes, resíduos), laboratório, aferição, estrutura física, dados da usina de asfalto, ensaios de validação, resultado (Classe I/II/III), fotos |
| `/NovaNC`, `/EditarNC` | NC avulsa | `RelatorioNC` | Dados da obra, classificação (local/categoria/parâmetro), descrição, ações, equipe, anexos |

### 5.6 Relatórios (1 página imprimível por tipo — todas com `.report-scope`)

Cada formulário tem seu relatório A4 (`/Relatorio<Tipo>?id=`). Estrutura comum: cabeçalho com logos (empresa + regional) e dados da obra, tabelas dos dados do ensaio, gráficos quando aplicável (curva granulométrica, Proctor, deflexões), observações, **rodapé de assinaturas** (laboratorista, aprovador técnico com CREA, cliente), **selo de assinatura eletrônica + QR Code de verificação** quando assinado, barra de aprovação (`AprovacaoBar`) no topo (fora da impressão) com ações aprovar/reprovar/assinar, banner de integridade (hash) e botão imprimir.

Rotas: `RelatorioDiario`, `RelatorioChecklist` (usina), `RelatorioChecklistAplicacao`, `RelatorioChecklistMRAF`, `RelatorioChecklistConcretagem`, `RelatorioChecklistTerraplanagem`, `RelatorioChecklistReciclagem`, `RelatorioCAUQ`, `RelatorioMRAF` (via `RelatorioEnsaio`), `RelatorioTaxaMRAF`, `RelatorioTaxaPinturaImprimacao`, `RelatorioTaxaInsumos`, `RelatorioManchaPendulo`, `RelatorioVigaBenkelman`, `RelatorioSondagem`, `RelatorioBoletimSondagem`, `RelatorioBoletimSondagemTrado`, `RelatorioProctor`, `RelatorioDensidadeInSitu`, `RelatorioGranulometriaIndividual`, `RelatorioGranuMistura`, `RelatorioRompimentoConcreto`, `RelatorioAcompanhamentoCarga`, `RelatorioAcompanhamentoUsinagem`, `RelatorioControleExecucaoServicos`, `RelatorioCertificacaoUsina`, `RelatorioNC`, `RelatorioEnsaio` (densidade), `RelatorioChecklistPage` (roteador genérico de checklist).

### 5.7 Relatório Consolidado Regional
- `/RelatoriosUnificados`: tela de filtros — obra, período (data início/fim), tipos de registro, laboratoristas → gera o consolidado.
- `/RelatorioUnificado?obra_id=&data_inicio=&data_fim=&tipos=`: documento com **capa** + todos os relatórios individuais do período renderizados em sequência (via `RecordRenderer`). É um **relatório virtual** (não persistido): a assinatura eletrônica usa um `compositeId` (`obraId_dataInicio_dataFim_tipos`) e o **hash é calculado no backend sobre os registros reconstruídos do banco** (`base44/shared/relatorioUnificadoRecon.ts`) — nunca sobre dados enviados pelo cliente.

### 5.8 Não Conformidades
- `/NaoConformidades`: painel com KPIs, gráficos (por categoria/local/status) e tabela de todas as NCs — tanto avulsas (`RelatorioNC`) quanto extraídas de checklists/diários (workflows de sincronização, ver §9).
- `/GestaoNC`: fluxo de tratamento — cards com filtros, modal de aprovação de NC pelo cliente (`approve_nc`), acompanhamento de status.
- `/NovaNC` e `/EditarNC`: formulário da NC avulsa.
- `/RelatorioNC?id=`: relatório imprimível da NC (com relatório vinculado quando originada de checklist).

### 5.9 Administração e apoio
- `/Users`: tabela de usuários, convite (`inviteUser`), edição de nível/cargo/CREA/empresa, ativação/desativação, filtros. Visível a admin/gestor/sala técnica/cliente(+supervisor) — cliente vê/gerencia seus funcionários.
- `/Produtividade`: grade mensal laboratorista × dia (OK / N.A. / registro feito), baseada em `ProdutividadeDiaria` + registros existentes.
- `/MonitorProdutividade` (admin): visão agregada de produtividade.
- `/ControleLaboratoristas` (admin): alocação de laboratoristas em regionais/obras.
- `/FaixasGranulometricas` (admin/sala técnica): CRUD de faixas normativas (CAUQ, MRAF, BGS, Camadas Granulares) com peneiras min/max — usadas nos ensaios de granulometria.
- `/SolicitacoesTransferencia`: aprovação/rejeição de pedidos de transferência de laboratoristas.
- `/MigracaoDados` (admin): utilitários de migração/correção de dados (chama funções de backend `fix*`, `migrar*`, `corrigir*`).
- `/Settings`: perfil (nome, telefone, cargo, CREA), **seção 2FA** (ativar TOTP com QR, códigos de recuperação), seletor de tema claro/escuro, exclusão da própria conta (função `excluirMinhaConta`).
- `/ReportarErro`: formulário de bug report (descrição, página, prints) → `BugReport` + notificação por email (função + workflow). Admin responde e muda status.
- `/historico-auditoria` (`HistoricoAuditoria`): consulta da trilha de auditoria de um registro (filtros por entidade/operação/usuário; exibe diffs campo a campo).
- `/ImpressionEtiquetas`: geração/impressão de etiquetas de coleta e de umidade a partir de planilha.
- `/ResumosPersonalizados`: extrator de resumos tabulares por tipo de ensaio com campos selecionáveis e período.
- `/verificar-assinatura` (público): input do código/hash → mostra validade, signatário, data e integridade do documento.

---

## 6. TABELAS DO BANCO (ENTIDADES)

> Todas têm campos built-in: `id`, `created_date`, `updated_date`, `created_by` (email), `created_by_id`.

### 6.1 Estruturais

**`Regional`** — unidade organizacional raiz (multi-tenant lógico).
Campos: `nome`*, `codigo`*, `descricao`, `responsavel`, `cliente` (nome do cliente, herdado por todas as obras), `estado`, `cidade_sede`, `endereco`, `telefone`, `email`, `logo_url` (impressa nos relatórios), `project_ids[]` (projetos herdados pelas obras), `laboratoristas_responsaveis[]` (emails), `gestores_contrato_responsaveis[]`, `salas_tecnicas_responsaveis[]`, `clientes_responsaveis[]`, `supervisores_responsaveis[]` (subset de clientes com poder de aprovação), `status` (ativa/inativa).
RLS: read por presença do email nas listas (ou admin/funcionarios_cliente); write por admin/sala técnica/gestor da regional.
Usada em: Regionais, filtros do Dashboard/MeusEnsaios, cabeçalho de todos os relatórios (logo/cliente), verificação de poder de aprovação, tenant check no backend de assinatura.

**`Obra`** — contrato/obra dentro de uma regional.
Campos: `name`*, `code`*, `regional_id`*, `tipo_obra`* (supervisao|gerenciamento|implantacao|conservacao|sondagem|levantamentos|homologacao_usinas), `status` (planejamento|em_andamento|concluida|pausada), `empreiteiras[]`, `clientes[]`, `usinas[]`, `rodovias[]`, `servicos[]`.
RLS: create/update/delete admin/sala técnica/gestor; read todos os papéis.
Usada em: TODAS as entidades de registro via `obra_id`; define os formulários disponíveis (`tipo_obra`); popula selects de rodovia/usina/empreiteira nos formulários.

**`Project`** — projeto técnico/dosagem (CAUQ, MRAF, BGS, concreto, granular).
Campos principais: identificação, tipo, especificação, faixa granulométrica (peneiras projeto + faixa de trabalho), agregados e proporções, parâmetros Marshall (densidade projeto, vazios, RBV, estabilidade), temperaturas de controle, dados do ligante, carta traço (concreto), arquivo PDF.
Usada em: Projects (CRUD), EnsaioCAUQ/GranuMistura/ChecklistUsina (parâmetros e faixas), Regionais (vínculo `project_ids`).

**`FaixaGranulometrica`** — faixas normativas reutilizáveis.
Campos: `tipo`* (CAUQ|MRAF|BGS|CAMADAS_GRANULARES), `nome`*, `especificacao`*, `orgao`*, `peneiras[]`* ({astm, abertura, min, max}), `status` (ativo/inativo).
RLS: só admin/sala técnica escrevem; leitura livre.
Usada em: FaixasGranulometricas (CRUD), formulários/relatórios de granulometria.

### 6.2 Registros de campo (todas seguem o ciclo de vida §7 e o padrão RLS §2.3)

Campos comuns a todas: `obra_id`*, data do registro, `laboratorista_name`, `observacoes`, `fotos[]`, `status` (rascunho|finalizado), `approved` (null|true|false), `approved_by`, `approved_date`, `approver_details` {name, position, crea_number}, `rejection_reason`, `was_rejected`, `client_signature` {signed_by, signed_date, engineer_name, crea_number}.

| Entidade | Conteúdo específico (além dos comuns) |
|---|---|
| `DiarioObra` | `cliente`, `jornada` {inicio,fim}, `tipo_local` (usina/campo), `empreiteira`, `usina_selecionada`, `rodovia`, `trecho`, `condicoes_climaticas` (enum 7), `temperatura`, `atividades_realizadas`, `acoes_corretivas_*`, `nao_conformidades[]` {local_nc, categoria_nc, parametro_nc, descricao}, `efetivo_obra_ativo` + `efetivo_maquinas` (26 contadores) + `efetivo_colaboradores` (17 contadores), `checklist_veiculo_ativo` + `checklist_veiculo` (condutor, veículo, placa, hodômetro, condições gerais, luzes traseiras/dianteiras por lado, itens de segurança, motor) |
| `ChecklistUsina` | `project_id`, `usina`, `projeto_utilizado`, `faixa_especificada`, `ligante`, `pedreira`, `inspetor_campo`, `engenheiro_responsavel`, `controle_agregados[]`, `equivalente_areia_*`, `rodadas_producao[]` (até 4), `controle_cauq`, `controle_ligante` (3 viscosidades c/ temp/SP/RPM/limite/conforme, recuperação elástica, penetração, ponto amolecimento, ponto fulgor), `medicoes_usina` {sub_trecho, servico, empreiteira, cargas[] (ticket, placa, ton, m³, temp, rodovia, equipe)}, `acoes_corretivas_*`, `nao_conformidades[]` |
| `ChecklistAplicacao` | clima por período, fresagem, pintura de ligação, controle de aplicação (temperaturas, espessuras, conformidade), medições geométricas, NCs |
| `ChecklistMRAF` | condicionamento de insumos, preparação de superfície, acompanhamento e controle de aplicação, NCs |
| `ChecklistConcretagem` | cargas de concreto (NF, placa, volume, slump, CPs moldados), clima, NCs |
| `ChecklistTerraplanagem` | `project_id`, `rodovia`, `empreiteira`, `estaca`, `camada`, `inspetor_fiscal`, `material`, `origem_material`, `nome_material`, umidade ótima proctor (+qtd/resultados), umidade in situ (+qtd/resultados), `ensaio_realizado_por` (Afirma Evias|Empreiteira), `periodos_clima[]`, `acompanhamento_execucao` (6 itens sim/não/N.A. + tipos de rolo + obs), `ensaios_empreiteira` (proctor, ISC, umidade frigideira, massa específica in situ, granulometria — cada um {realizado, quantidade, conforme, resultados, obs} — + variação de umidade e grau de compactação), NCs |
| `ChecklistReciclagem` | acompanhamento de execução, ensaios da empreiteira, clima, NCs |
| `EnsaioCAUQ` | extração de ligante (% betume), granulometria (peneiras passantes vs faixa de trabalho), Marshall (CPs: pesos, densidades, vazios, VAM, RBV, estabilidade, fluência, RTCD), densidade Rice, referências do projeto |
| `EnsaioMRAF` | extração de ligante, granulometria da mistura |
| `EnsaioTaxaMRAF` | dimensões da bandeja, ensaios de taxa aplicada, resumo estatístico |
| `EnsaioTaxaPinturaImprimacao` | área da bandeja, execução (pesos, taxas), resíduo de emulsão |
| `EnsaioTaxaInsumos` | `tipo_insumo`* (cimento|agregado), `rodovia`, `trecho`, `material`, `servico`, `placa_caminhao`, `dimensoes_bandeja` {lado_1, lado_2, area}, `ensaios[]` {numero, hora, camada, estaca, no_bandeja, peso_bandeja_amostra, peso_bandeja, peso_amostra, taxa_aplicada} |
| `EnsaioManchaPendulo` | ensaios de mancha de areia (diâmetros → altura média), pêndulo britânico (BPN), classificação macro/microtextura, dados do cliente |
| `EnsaioVigaBenkelman` | leituras de deflexão por estaca/pista, D0/D25, raio de curvatura, estatísticas |
| `EnsaioSondagem` | perfil de sondagem por profundidade, NA, classificações |
| `BoletimSondagem` | `cliente`, `pista`, `bordo`, `rodovia`, `km`, `furo`, `operador`, `face_classificacao_1/2`, `camadas[]` (prof_de/ate, espessura, NA, 2 classificações), `camadas_2[]`, `umidade_natural` e `umidade_natural_2` (cápsulas, massas, umidades), `densidade_in_situ` (legado) e `densidades_in_situ[]` (frasco de areia completo: pesos, volume do furo, densidades úmida/seca, teor de umidade) |
| `BoletimSondagemTrado` | igual ao PI com 1 classificação, + `ensaio_insitu_realizado` |
| `EnsaioProctor` | pontos de compactação (massas, volumes), umidades por ponto, densidade seca máx., umidade ótima, energia, CBR/expansão |
| `EnsaioDensidade` | `sample_id`*, `extraction_date`*, `location`, `pesos` {espessura_cp, peso_seco_ar, peso_imerso, peso_sss, densidade_max_teorica, fator_correcao_prensa} |
| `EnsaioDensidadeInSitu` | frasco de areia, densidade seca, grau de compactação vs proctor |
| `EnsaioGranulometriaIndividual` | agregados ensaiados, peneiramento por agregado, equivalente de areia |
| `GranuMistura` / `EnsaioGranMistura` | peneiramento da mistura, umidade, pulverulentos, equivalente de areia, faixa de projeto (`GranuMistura` é a entidade atual; `EnsaioGranMistura` legado) |
| `EnsaioRompimentoConcreto` | identificação dos CPs, datas de moldagem/ruptura, idades, cargas, tensões, fck |
| `AcompanhamentoCarga` | `project_id`, `rodovia`, `trecho`, `sub_trecho`, `usina_fornecedora`, `servico` (remendos|capa_reperfilagem), `jornada`, `cargas[]` (até 20: numero, ticket/NF, placa, hora_saida, peso_ton, hora_chegada, temp_chegada, hora_aplicacao, temp_espalhamento, temp_compactacao, pista, espessura_cm, estacas, obs) |
| `AcompanhamentoUsinagem` | cargas produzidas e controle de agregados da usinagem |
| `ControleExecucaoServicos` | `rodovia`, `trecho`, `servicos[]` {servico, estaca_inicial/final, comprimento_m, espessura_cm, largura_m, quantidade, executora}, fotos com legenda |
| `CertificacaoUsina` | `razao_social`, `interessado`, `responsavel_tecnico`, contato, `data_vistoria`*, `avaliador`, `cnpj`, `validade`, `localizacao`, `marca_usina`, `numero_serie`, mineralogia, `classe_usina`, `tipo_dosagem`, `tipo_secagem`, `aspectos_legais` (6 licenças sim/não), `saude_seguranca`, `meio_ambiente` (ruídos, emissão atmosférica, efluentes, resíduos, contaminação, considerações — dezenas de itens sim/não), `laboratorio`, `afeicao`, `estrutura_fisica`, `usina_asfalto` (~30 campos técnicos), `ensaios_validacao`, `resultado_classe` (Classe I/II/III), fotos |
| `RelatorioNC` | NC avulsa: dados da obra, classificação (local/categoria/parâmetro), descrição, ações corretivas, equipe RNC, anexos, status de tratamento, vínculo com registro de origem (quando sincronizada de checklist) |

### 6.3 Operação e apoio

**`SolicitacaoTransferenciaObra`** — pedido de laboratorista para trocar de obra.
Campos: `laboratorista_email`*, `laboratorista_name`*, `obra_atual_id/nome`, `obra_destino_id/nome`*, `motivo`*, `status` (pendente|aprovada|rejeitada), `aprovado_por`, `aprovado_em`, `motivo_rejeicao`.
RLS: cria o próprio laboratorista; lê/atualiza gestores+admin+o próprio.
Usada em: Regionais (modal), SolicitacoesTransferencia, badge da sidebar.

**`SolicitacaoTransferenciaRegional`** — idem para regional.

**`ProdutividadeDiaria`** — marcação manual de dia do laboratorista.
Campos: `laboratorista_email`*, `data`*, `status`* (N/A | OK).
Usada em: Produtividade, MonitorProdutividade (dias sem registro são cruzados com os registros criados).

**`BugReport`** — relatos de erro dos usuários.
Campos: `descricao`*, `pagina`*, `prints[]`, `status` (aberto|em_analise|resolvido), `resposta_admin`.
RLS: qualquer um cria; lê o criador e admin.
Usada em: ReportarErro + workflow de notificação por email.

**`ErrorLog`** — observabilidade de erros de frontend.
Campos: `category`, `message`*, `stack`, `component_stack`, `source` (error boundary, window.onerror, unhandledrejection), `page`, `user_agent`, `context`.
RLS: create só via backend (false no cliente... criado via função de observabilidade), leitura só admin.
Usada em: ErrorBoundary/observability pipeline.

### 6.4 Segurança e compliance

**`AssinaturaEletronica`** — registro imutável de cada ato de assinatura.
Campos: `entity_name`*, `entity_id`*, `status_assinatura` (nao_assinado|assinado), `signature_method` (eletronica_simples_reforcada; reservado pades_icp_brasil), `signature_type` (approve | approve_nc | sign), `signed_at` (timestamp do SERVIDOR), `signature_hash` (SHA-256 do documento no estado assinado), `signature_evidence` {ip_address, user_agent, geolocation?, reauth_factor}, `signed_by`, `signed_by_name`, `signed_by_role`, `signed_by_crea`, campos reservados para provedor ICP-Brasil.
RLS: **append-only** — criada só pelo backend (`assinarEletronicamente`), nunca alterada/excluída.
Usada em: AprovacaoBar, selos nos relatórios, VerificarAssinatura, IntegrityBanner.

**`AuditTrail`** — trilha de auditoria tamper-evident.
Campos: `entity_name`*, `entity_id`, `operation`* (create|update|delete|approve|reject|sign|approve_nc|reject_nc|solicitar_aprovacao_nc|update_nc_status|login_success|login_failure|logout|logout_inactivity|password_reset_request|password_reset|report_exported|permission_updated|user_created|user_deactivated|token_expired), `changes[]` (campo, valor anterior, valor novo), `changed_by`, `changed_by_name`, `actor_role`, `client_timestamp`, `is_offline_sync`, `ip_address`, `device_info`, `result` (success|failure), `failure_reason`, `chain_hash` (SHA-256 do conteúdo + hash anterior), `previous_hash`.
RLS: append-only (criada pela função `registrarAuditoria`).
Usada em: HistoricoAuditoria, todos os fluxos de CRUD/aprovação/login.

**`TwoFactorConfig`** — 2FA TOTP por usuário.
Campos: `user_email`*, `secret`* (base32, NUNCA exposto ao cliente), `status` (pending|active), `recovery_codes[]` (hashes SHA-256), `failed_attempts`, `locked_until`, `last_verified_at`, `activated_at`.
RLS: tudo restrito a admin (acesso real só via função `gerenciarDoisFatores`).
Usada em: Settings (TwoFactorSection), TwoFactorGate (login), step-up nas assinaturas (TotpPromptDialog).

---

## 7. CICLO DE VIDA DE UM REGISTRO (regra de negócio central)

```
[rascunho] --finalizar (confirmação de veracidade)--> [finalizado / pendente]
[finalizado] --aprovar (gestor/supervisor, com step-up 2FA se ativo)--> [aprovado] → assinatura eletrônica "approve" + hash de integridade
[finalizado] --reprovar (motivo obrigatório)--> [reprovado] → criador edita → was_rejected=true → volta a pendente
[aprovado]  --assinar (cliente engenheiro)--> client_signature + assinatura "sign"
```

Regras:
- Rascunho é editável só pelo criador; some das visões de aprovação.
- Registro aprovado fica **imutável** na prática (edição bloqueada na UI; alterações administrativas não entram no hash — o hash exclui campos de status/aprovação).
- Toda aprovação/reprovação/assinatura passa por **funções de backend** (`gerenciarAprovacao`, `assinarEletronicamente`) que: validam permissão + tenant (regional), reautenticam (senha e/ou TOTP), calculam hash SHA-256 do documento, gravam `AssinaturaEletronica` + `AuditTrail` com IP/dispositivo.
- O relatório mostra banner de integridade: recalcula o hash atual e compara com o hash assinado — alerta se o documento foi alterado após a assinatura.
- Verificação pública: QR Code no relatório → `/verificar-assinatura` → função `verificarAssinatura` confirma autenticidade sem login.

---

## 8. FUNÇÕES DE BACKEND (`base44/functions/`)

| Função | Papel |
|---|---|
| `assinarEletronicamente` | Núcleo das assinaturas: valida usuário/tenant/entidade, exige reautenticação (senha; TOTP se ativo), calcula hash SHA-256 (para RelatorioUnificado reconstrói o conteúdo do banco via `base44/shared/relatorioUnificadoRecon.ts` — nunca confia em dados do cliente), grava `AssinaturaEletronica` + auditoria, atualiza o registro (approved/client_signature) |
| `verificarAssinatura` | Verificação pública de autenticidade (QR Code) |
| `gerenciarAprovacao` | Aprovar/reprovar registro com validação de permissão por regional |
| `gerenciarDoisFatores` | Setup/ativação/verificação/desativação do TOTP, códigos de recuperação, lockout por tentativas |
| `registrarAuditoria` | Grava entradas do AuditTrail com hash encadeado (server-side) |
| `validarESalvarRegistro` | Persistência validada de registros (sanitização XSS, validação de schema) |
| `validarUploadArquivo` | Validação de uploads (tipo/tamanho) |
| `exportarEnsaiosPDF` | Exportação em massa de registros para PDF |
| `extrairDadosProjeto` | Extração de dados de PDF de projeto via LLM |
| `carregarRegistrosSupervisor` / `carregarObrasFuncionarioCliente` / `getRegionalUsers` | Consultas otimizadas com service role respeitando tenant |
| `updateLastLogin` | Atualiza `last_login` |
| `excluirMinhaConta` | Autoexclusão de conta |
| `notificarBugReport` | Email de notificação de bug |
| `recalcularFillerBetume`, `recalcularConformidadeChecklistAplicacao`, `fixRecordStatus`, `corrigirNomesDiarioObra`, `migrarPeneirasProjects`, `adicionarPeneirasCAUQ`, `adicionarPeneira10Projetos`, `limparTodasPeneirasProjects`, `cleanRegionalUserInconsistencies` | Utilitários de migração/correção de dados (tela MigracaoDados) |

Módulos compartilhados (`base44/shared/`): `totp.ts` (TOTP RFC 6238), `tenantAccess.ts` (verificação de acesso por regional), `relatorioUnificadoRecon.ts` (reconstrução server-side do relatório unificado).

---

## 9. WORKFLOWS (`base44/workflows/`)

1. **Export * to Drive** (~20 workflows): a cada criação/atualização de registro (DiarioObra, Checklists, Ensaios, Acompanhamentos), exporta os dados para o Google Drive.
2. **Sincronizar NCs - *** (7 workflows): quando um checklist/diário com `nao_conformidades[]` é salvo, cria/atualiza registros `RelatorioNC` correspondentes — alimenta o painel de NCs.
3. **Notificar Bug Report por Email**: novo `BugReport` → email ao admin.

---

## 10. ARQUITETURA OFFLINE (PWA)

- Service worker (`public/sw.js`) + fila de operações (`offlineQueue`) + armazenamento local (`offlineStorageService`, `offlineCacheService`, `offlinePhotoService` para fotos pendentes).
- Registros criados/editados offline entram na fila; `syncService` sincroniza ao reconectar (com resolução de conflitos server-authoritative — `conflictResolution.js` + `ConflictResolutionDialog`).
- Auditoria marca `is_offline_sync=true` e guarda `client_timestamp`.
- `OfflineStatusBar` mostra estado da fila; `useOfflineDetection` monitora conectividade.

---

## 11. ESTRUTURA DE PASTAS (mapa para navegação do código)

```
base44/
  entities/*.jsonc         → schemas + RLS de todas as tabelas
  functions/*/entry.ts     → funções serverless (Deno)
  shared/*.ts              → módulos compartilhados do backend
  workflows/*.jsonc        → automações
src/
  App.jsx                  → router (rotas explícitas + loop do pages.config)
  pages.config.js          → registro manual de páginas (lazy) + mainPage
  Layout.jsx               → layout com sidebar/bottom-nav + report-scope
  index.css                → design system completo (tokens, dark mode, print)
  pages/                   → 1 arquivo (ou pasta index.jsx) por tela
  components/
    ui/                    → shadcn
    layout/                → sidebar, bottom nav, diálogo novo registro
    ensaios/               → hub MeusEnsaios (interfaces por papel, mappers)
    relatorios/ + relatorio-*/ → componentes dos relatórios A4
    <dominio>/             → componentes de cada formulário
    offline/, auth/, forms/, nc/, dashboard/, projects/, regionais/...
  hooks/                   → use<Tela>Form / use<Tela>Data / use<Tela>Actions (padrão por tela)
  services/                → camada de API (recordsService central + serviços por domínio)
  utils/                   → cálculos de ensaio, validações, acessControl, auditoria, hash, sanitização
  lib/                     → AuthContext, query-client, lazyWithRetry, constantes de layout
  tests/                   → vitest (unit/integration/security/performance) + e2e Playwright
```

Padrões arquiteturais documentados em `src/docs/governanca/` (ADRs): páginas orquestradoras finas, lógica em hooks, camada de services, testes obrigatórios em refatorações, arquitetura offline.

---

## 12. RESUMO DO ESSENCIAL PARA REFAZER DO ZERO

1. **Modelo**: Regional (com listas de responsáveis por papel) → Obra (com tipo_obra que define formulários) → ~25 entidades de registro com campos comuns de ciclo de vida (status/approved/assinaturas) + Project/FaixaGranulometrica como catálogos técnicos.
2. **Permissões**: 7 níveis; tudo gira em torno de (a) listas de emails por papel na Regional, (b) created_by para laboratoristas, (c) aprovadores globais vs supervisores por regional.
3. **Fluxo**: rascunho → finalizado → aprovado/reprovado → assinado, com imutabilidade pós-aprovação, hash de integridade e trilha de auditoria encadeada.
4. **Relatórios**: 1 documento A4 imprimível por registro + consolidado regional virtual; assinatura com QR de verificação pública.
5. **Segurança**: aprovações/assinaturas SEMPRE no backend, com reautenticação (senha/TOTP), evidências (IP, device, geo) e entidades append-only.
6. **Offline**: fila de sincronização com resolução de conflitos e auditoria da origem offline.

---

## 13. REGISTRO CENTRAL DE TIPOS (`src/components/ensaios/ensaioMappers.jsx`) — fonte única de verdade

O nome do app é **"AEVIAS CONTROLE"** (`base44/config.jsonc`).

Cada tipo de registro tem UMA entrada no objeto `ENSAIO_CONFIG` com: nome exibido, label curto, ícone, **cor de identidade** (usada em badges/cards/gráficos), **campo de data** do registro, **página de relatório** e funções opcionais (`localInfo`, `responsavel`, `hasEmpreiteira`, `ncExtractor`). Adicionar um tipo novo = adicionar uma entrada aqui (+ entidade + formulário + relatório + registro em pages.config).

| Entidade | Campo de data | Relatório | Cor |
|---|---|---|---|
| DiarioObra | data | RelatorioDiario | #BFCF99 |
| EnsaioCAUQ | data_ensaio | RelatorioCAUQ | #00233B |
| EnsaioMRAF | data_ensaio | RelatorioEnsaio?tipo=mraf | #4B5563 |
| EnsaioDensidade | extraction_date | RelatorioEnsaio?tipo=densidade | #566E3D |
| EnsaioDensidadeInSitu | data_ensaio | RelatorioDensidadeInSitu | #6B8E23 |
| EnsaioTaxaPinturaImprimacao | data_ensaio | RelatorioTaxaPinturaImprimacao | #4682B4 |
| ChecklistUsina | data | RelatorioChecklist | #FBBF24 |
| ChecklistAplicacao | data | RelatorioChecklistAplicacao | #800020 |
| ChecklistMRAF | data | RelatorioChecklistMRAF | #4A90E2 |
| ChecklistConcretagem | data | RelatorioChecklistConcretagem | #8B4513 |
| ChecklistTerraplanagem | data | RelatorioChecklistTerraplanagem | #228B22 |
| ChecklistReciclagem | data | RelatorioChecklistReciclagem | #854d0e |
| EnsaioSondagem | data | RelatorioSondagem | #4682B4 |
| EnsaioGranulometriaIndividual | data_ensaio | RelatorioGranulometriaIndividual | #9B59B6 |
| AcompanhamentoUsinagem | data | RelatorioAcompanhamentoUsinagem | #1ABC9C |
| AcompanhamentoCarga | data | RelatorioAcompanhamentoCarga | #E67E22 |
| EnsaioManchaPendulo | data_ensaio | RelatorioManchaPendulo | #E74C3C |
| EnsaioVigaBenkelman | data_realizacao | RelatorioVigaBenkelman | #3498DB |
| EnsaioTaxaMRAF | data_ensaio | RelatorioTaxaMRAF | #4682B4 |
| EnsaioTaxaInsumos | data_ensaio | RelatorioTaxaInsumos | #0891B2 |
| BoletimSondagem | data | RelatorioBoletimSondagem | #6A5ACD |
| BoletimSondagemTrado | data | RelatorioBoletimSondagemTrado | #708090 |
| EnsaioProctor | data_ensaio | RelatorioProctor | #DAA520 |
| EnsaioRompimentoConcreto | data_ensaio | RelatorioRompimentoConcreto | #B22222 |
| GranuMistura | data_ensaio | RelatorioGranuMistura | #9932CC |
| ControleExecucaoServicos | data | RelatorioControleExecucaoServicos | #2E8B57 |
| CertificacaoUsina | data_vistoria | RelatorioCertificacaoUsina | #7C3AED |

### 13.1 NCs AUTOMÁTICAS por não-conformidade (regra de negócio importante)

Além das NCs digitadas manualmente, o sistema **extrai NCs automaticamente** dos campos de conformidade (`ncExtractor`):
- **ChecklistUsina** (controle CAUQ): Granulometria, Volume de Vazios, RBV, RTCD 25°C, Estabilidade, Fluência, Extração de Ligante (Rotarex/Soxhlet) — cada item `conforme === false` vira NC.
- **ChecklistAplicacao**: Taxa de Pintura e Taxa de Pintura Residual não conformes.
- **ChecklistMRAF**: Taxa de Aplicação, Resíduo da Emulsão, Espessura da Camada.
- **ChecklistConcretagem**: Slump Test e Espessura da Camada **por carga** (identifica o nº da carga).
- **EnsaioManchaPendulo**: `condicao_conformidade === "NÃO CONFORME"`.
- **EnsaioVigaBenkelman**: qualquer deflexão (bordo esq./eixo/bordo dir.) acima da `def_admissivel` — lista as estacas afetadas.

---

## 14. ROTEAMENTO — DETALHES DE IMPLEMENTAÇÃO

- `src/pages.config.js` é **manual** (não auto-gerado): lazy import + entrada no objeto `PAGES` + (se relatório) entrada em `REPORT_PAGES`. `mainPage: "Dashboard"` define a rota `/`.
- Rotas **explícitas fora do loop** em `App.jsx`: `/EnsaioTaxaInsumos`, `/RelatorioTaxaInsumos`, `/historico-auditoria`, `/ReportarErro` e a pública `/verificar-assinatura`.
- Rotas protegidas são aninhadas em `ProtectedRoute` **e** `TwoFactorGate` (usuário com TOTP ativo precisa validar o código a cada sessão antes de acessar qualquer tela).
- `src/lib/reportPages.js`: `REPORT_PAGES` (29 páginas que renderizam com `.report-scope`, sem sidebar) e `FORM_PAGE_PREFIXES` (Checklist/Ensaio/Diario/Boletim/Acompanhamento/ControleExecucao — páginas onde o pull-to-refresh é desabilitado para não atrapalhar a digitação).
- Code-splitting: todas as páginas são `React.lazy` com **retry automático** (`lazyWithRetry` — recarrega chunk que falhou após deploy) + `prefetchFieldPages` pré-carrega as páginas de campo após o login.
- Zonas de abas mobile (`TAB_ZONES`): home, regionais, projects, registros — cada aba do BottomNav mantém sua própria pilha de navegação (comportamento de app nativo, com tratamento do botão voltar do Android).

---

## 15. AUTENTICAÇÃO E SESSÃO — DETALHES (`src/lib/AuthContext.jsx`)

- Boot do app: consulta public settings → valida token → `auth.me()` → dispara em background a **preparação do cache offline** e o prefetch das páginas de campo.
- **Modo offline "WhatsApp"**: sem rede + token presente → o app abre usando o **usuário em cache** (`getDataCache('currentUser')`), sem validar com o servidor. Falha de rede sem status HTTP (sinal fraco no mobile) também cai no cache. 401/403 real → exige login.
- **Timeout de sessão**: logout automático após **8 horas de inatividade**, com modal de aviso e contagem regressiva de 60s (botões "continuar conectado" / "sair agora"). Logout audita o motivo (`manual` | `inactivity`).
- Erros de app-level tratados: `auth_required`, `user_not_registered` (tela própria `UserNotRegisteredError`).

---

## 16. OBSERVABILIDADE, QUALIDADE E TESTES

- **Pipeline de erros**: `ErrorBoundary` (React) + `window.onerror` + `unhandledrejection` → categorização (`errorCategorizer`) → gravação em `ErrorLog` com página, user-agent e contexto. `logger` com gate de produção (não loga em prod).
- **Analytics de navegação**: `NavigationTracker` registra trocas de rota.
- **Testes** (vitest + Playwright):
  - `src/tests/security/`: sanitização XSS/SSTI, hash de integridade e tamper, assinatura eletrônica, RLS/permissões de edição, tenant, força de senha, 2FA, append-only.
  - `src/tests/integration/`: fluxos críticos, ciclo de vida do ensaio, aprovação+assinatura, workflow offline, resolução de conflitos, integridade referencial.
  - `src/tests/utils|hooks|services|components/`: unitários por módulo (cálculos de cada ensaio, mappers, validações).
  - `src/tests/performance/`: benchmarks de sincronização e escalabilidade.
  - `e2e/`: Playwright com mock de API (fluxo crítico de ensaio).
- **Governança** (`src/docs/governanca/`): ADR-001 páginas orquestradoras, ADR-002 lógica em hooks, ADR-003 camada de services, ADR-004 arquitetura offline, ADR-005 testes obrigatórios em refatorações; políticas de sanitização XSS e auditoria; convenções de código; roadmap arquitetural.
- Script `scripts/check-pages-registration.js` valida que toda página está registrada no roteamento.

---

## 17. DESIGN SYSTEM (resumo de `src/index.css` + `tailwind.config.js`)

- **Identidade**: navy `#00233B` (primária), verde-oliva `#BFCF99` (secundária/destaques), fundo off-white `#F0F2F5`. Fontes: **Exo** (títulos) e **Poppins** (corpo).
- Tokens CSS semânticos (`--color-*`, `--radius-*`, `--shadow-*`, `--space-*`) em `:root` e `.dark`; tokens shadcn em HSL; sidebar escura fixa.
- **Dark mode** por classe, com camada de "remap" para superfícies claras fixas (formulários usam bg-white/slate-50 e recebem texto escuro restaurado).
- **`.report-scope`**: relatórios SEMPRE claros (fundo branco), mesmo em dark mode — reset completo dos tokens + neutralização dos remaps.
- **Impressão**: `@page` A4 com margem 10mm, `print-color-adjust: exact`, `[data-print-container]` sem padding, classe `print:hidden` para toolbars.
- **Mobile**: fonte global 14px, área de toque mínima 44px (WCAG 2.1 AA, exceto icon-buttons compactos), scrollbars ocultas, containers de formulário esticados à viewport, safe-areas (notch) tratadas por componente.
- Acessibilidade: focus-visible global com outline do token `--ring`.

---

## 18. CHECKLIST DE PARIDADE PARA A REESCRITA

Funcionalidades fáceis de esquecer que o sistema atual possui:
1. NCs automáticas por conformidade (§13.1) + sincronização de NCs via workflows.
2. Verificação pública de assinatura por QR Code (rota sem login).
3. Step-up 2FA na aprovação/assinatura (não só no login).
4. Hash de integridade que EXCLUI campos administrativos (permite aprovar sem invalidar assinatura anterior).
5. Auditoria com hash encadeado (tamper-evident) incluindo eventos de login/logout/exportação.
6. Modo offline completo: abrir o app sem rede (usuário em cache), criar/editar registros, fotos pendentes, fila de sync com resolução de conflitos server-authoritative.
7. Diálogo de confirmação de veracidade ao finalizar registro.
8. Registro reprovado volta a ser editável e marca `was_rejected` (histórico visível).
9. Transferência de laboratorista entre obras/regionais com fluxo de aprovação.
10. Produtividade cruzando registros criados × marcações manuais (OK/N.A.).
11. Extração de dados de PDF de projeto via LLM.
12. Exportação automática de registros para Google Drive (workflows).
13. Etiquetas de coleta/umidade e resumos personalizados tabulares.
14. Timeout de sessão de 8h com aviso; auditoria de inatividade.
15. Pull-to-refresh desabilitado em formulários; pilhas de navegação por aba no mobile.
16. Lazy loading com retry de chunk pós-deploy + prefetch de páginas de campo.
17. Logo da regional impressa no cabeçalho dos relatórios.
18. Relatório unificado é virtual — hash server-side reconstruído do banco (nunca confiar no cliente).