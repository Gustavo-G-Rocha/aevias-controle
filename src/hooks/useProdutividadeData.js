import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const DATE_FIELD = {
  DiarioObra: 'data',
  ChecklistUsina: 'data',
  ChecklistAplicacao: 'data',
  ChecklistMRAF: 'data',
  ChecklistConcretagem: 'data',
  ChecklistTerraplanagem: 'data',
  ChecklistReciclagem: 'data',
  EnsaioCAUQ: 'data_ensaio',
  EnsaioDensidade: 'extraction_date',
  EnsaioDensidadeInSitu: 'data_ensaio',
  EnsaioSondagem: 'data',
  EnsaioTaxaPinturaImprimacao: 'data_ensaio',
  AcompanhamentoCarga: 'data',
  EnsaioMRAF: 'data_ensaio',
  EnsaioManchaPendulo: 'data_ensaio',
  EnsaioVigaBenkelman: 'data_ensaio',
  EnsaioTaxaMRAF: 'data_ensaio',
  AcompanhamentoUsinagem: 'data',
  EnsaioGranulometriaIndividual: 'data_ensaio',
  GranuMistura: 'data',
  EnsaioProctor: 'data_ensaio',
  EnsaioRompimentoConcreto: 'data_ensaio',
  BoletimSondagem: 'data',
  BoletimSondagemTrado: 'data',
};

// Extrai resultado de Promise.allSettled, retornando [] em caso de rejeição
const settled = (results) =>
  results.map(r => (r.status === 'fulfilled' ? r.value : []));

export function useProdutividadeData(currentMonth) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [laboratoristas, setLaboratoristas] = useState([]);
  const [produtividade, setProdutividade] = useState({});
  const [empreiteiras, setEmpreiteiras] = useState([]);
  const [usinas, setUsinas] = useState([]);
  const marcadoresDiaRef = useRef({});

  // Cache de todos os registros de entidades (não varia por mês)
  const entityCacheRef = useRef(null);
  // Cache de dados processados por chave "YYYY-MM"
  const monthCacheRef = useRef({});

  const loadData = useCallback(async (force = true) => {
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

    // Se já temos cache do mês e não é forced, usa direto
    if (!force && monthCacheRef.current[monthKey]) {
      const cached = monthCacheRef.current[monthKey];
      setLaboratoristas(cached.laboratoristas);
      setProdutividade(cached.produtividade);
      marcadoresDiaRef.current = cached.marcadoresDia;
      setEmpreiteiras(cached.empreiteiras);
      setUsinas(cached.usinas);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userAccessLevel = currentUser?.access_level || (currentUser?.role === 'admin' ? 'admin' : 'user');
      const isAdmin = userAccessLevel === 'admin';

      const [regionais, allUsers, obras] = await Promise.all([
        base44.entities.Regional.list(),
        base44.entities.User.list(),
        base44.entities.Obra.list()
      ]);

      // ── 1. Determinar obras visíveis conforme perfil ─────────────────────────
      let obrasVisiveisIds;
      if (isAdmin) {
        obrasVisiveisIds = new Set(obras.map(o => o.id));
      } else {
        const regionaisVisiveis = regionais.filter(r =>
          r.gestor_contrato_responsavel?.toLowerCase() === currentUser.email?.toLowerCase() ||
          (r.gestores_contrato_responsaveis || []).some(e => e.toLowerCase() === currentUser.email?.toLowerCase()) ||
          (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === currentUser.email?.toLowerCase())
        );
        const regionaisVisiveisIds = new Set(regionaisVisiveis.map(r => r.id));
        obrasVisiveisIds = new Set(obras.filter(o => regionaisVisiveisIds.has(o.regional_id)).map(o => o.id));
      }

      // ── 2. Empreiteiras e usinas das obras visíveis ──────────────────────────
      const empresasSet = new Set();
      const usinasSet = new Set();
      obras.forEach(obra => {
        if (!obrasVisiveisIds.has(obra.id)) return;
        (obra.empreiteiras || []).forEach(e => { empresasSet.add(e); });
        (obra.usinas || []).forEach(u => { usinasSet.add(u); });
      });
      const empreiteirasArr = Array.from(empresasSet).sort();
      const usinasArr = Array.from(usinasSet).sort();
      setEmpreiteiras(empreiteirasArr);
      setUsinas(usinasArr);

      // ── 3. Buscar registros de entidades (com cache global, não por mês) ──────
      if (force || !entityCacheRef.current) {
        const lote1 = settled(await Promise.allSettled([
          base44.entities.DiarioObra.list("-created_date", 500),
          base44.entities.ChecklistUsina.list("-created_date", 500),
          base44.entities.ChecklistAplicacao.list("-created_date", 500),
          base44.entities.ChecklistMRAF.list("-created_date", 500),
          base44.entities.ChecklistConcretagem.list("-created_date", 500),
          base44.entities.ChecklistTerraplanagem.list("-created_date", 500),
          base44.entities.ChecklistReciclagem.list("-created_date", 500),
          base44.entities.EnsaioCAUQ.list("-created_date", 500),
        ]));

        const lote2 = settled(await Promise.allSettled([
          base44.entities.EnsaioDensidade.list("-created_date", 500),
          base44.entities.EnsaioDensidadeInSitu.list("-created_date", 500),
          base44.entities.EnsaioSondagem.list("-created_date", 500),
          base44.entities.EnsaioTaxaPinturaImprimacao.list("-created_date", 500),
          base44.entities.AcompanhamentoCarga.list("-created_date", 500),
          base44.entities.EnsaioMRAF.list("-created_date", 500),
          base44.entities.EnsaioManchaPendulo.list("-created_date", 500),
          base44.entities.EnsaioVigaBenkelman.list("-created_date", 500),
        ]));

        const lote3 = settled(await Promise.allSettled([
          base44.entities.EnsaioTaxaMRAF.list("-created_date", 500),
          base44.entities.AcompanhamentoUsinagem.list("-created_date", 500),
          base44.entities.EnsaioGranulometriaIndividual.list("-created_date", 500),
          base44.entities.GranuMistura.list("-created_date", 500),
          base44.entities.EnsaioProctor.list("-created_date", 500),
          base44.entities.EnsaioRompimentoConcreto.list("-created_date", 500),
          base44.entities.BoletimSondagem.list("-created_date", 500),
          base44.entities.BoletimSondagemTrado.list("-created_date", 500),
        ]));

        entityCacheRef.current = {
          diarios: lote1[0], checklistsUsina: lote1[1], checklistsAplicacao: lote1[2],
          checklistsMRAF: lote1[3], checklistsConcretagem: lote1[4], checklistsTerraplanagem: lote1[5],
          checklistsReciclagem: lote1[6], ensaiosCAUQ: lote1[7],
          ensaiosDensidade: lote2[0], ensaiosDensidadeInSitu: lote2[1], ensaiosSondagem: lote2[2],
          ensaiosTaxaPintura: lote2[3], acompanhamentoCarga: lote2[4], ensaiosMRAF: lote2[5],
          ensaiosManchaPendulo: lote2[6], ensaiosVigaBenkelman: lote2[7],
          ensaiosTaxaMRAF: lote3[0], acompanhamentosUsinagem: lote3[1], ensaiosGranuIndividual: lote3[2],
          granuMisturas: lote3[3], ensaiosProctor: lote3[4], ensaiosRompimentoConcreto: lote3[5],
          boletinsSondagem: lote3[6], boletinsSondagemTrado: lote3[7],
        };
      }

      const ec = entityCacheRef.current;

      // ProdutividadeDiaria sempre busca fresco (marcadores são dinâmicos)
      const [produtividadeDiariaResult] = settled(await Promise.allSettled([
        base44.entities.ProdutividadeDiaria.list(),
      ]));
      const produtividadeDiaria = produtividadeDiariaResult;

      // ── 4. Intervalo de datas do mês visualizado ─────────────────────────────
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const todayLocal = new Date();
      const isViewingCurrentMonth =
        currentMonth.getFullYear() === todayLocal.getFullYear() &&
        currentMonth.getMonth() === todayLocal.getMonth();
      const endDate = isViewingCurrentMonth
        ? new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate())
        : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // ── 5. Processar registros — acumular por email ──────────────────────────
      const prodData = {};

      const processarRegistros = (registros, entityName) => {
        const dateField = DATE_FIELD[entityName] || 'data';
        registros.forEach(reg => {
          if (!obrasVisiveisIds.has(reg.obra_id)) return;
          const rawDate = reg[dateField];
          if (!rawDate || !reg.created_by) return;

          const datePart = rawDate.substring(0, 10);
          const [y, m, d] = datePart.split('-').map(Number);
          if (!y || !m || !d) return;

          const regDate = new Date(y, m - 1, d);
          if (regDate < startDate || regDate > endDate) return;

          const email = reg.created_by.toLowerCase();
          if (!prodData[email]) prodData[email] = {};
          const dia = regDate.getDate();
          if (!prodData[email][dia]) prodData[email][dia] = [];
          prodData[email][dia].push({
            id: reg.id,
            tipo: entityName,
            empreiteira: reg.empreiteira || '',
            usina: reg.usina_selecionada || reg.usina || '',
            entityName
          });
        });
      };

      processarRegistros(ec.diarios, 'DiarioObra');
      processarRegistros(ec.checklistsUsina, 'ChecklistUsina');
      processarRegistros(ec.checklistsAplicacao, 'ChecklistAplicacao');
      processarRegistros(ec.checklistsMRAF, 'ChecklistMRAF');
      processarRegistros(ec.checklistsConcretagem, 'ChecklistConcretagem');
      processarRegistros(ec.checklistsTerraplanagem, 'ChecklistTerraplanagem');
      processarRegistros(ec.checklistsReciclagem, 'ChecklistReciclagem');
      processarRegistros(ec.ensaiosCAUQ, 'EnsaioCAUQ');
      processarRegistros(ec.ensaiosDensidade, 'EnsaioDensidade');
      processarRegistros(ec.ensaiosDensidadeInSitu, 'EnsaioDensidadeInSitu');
      processarRegistros(ec.ensaiosSondagem, 'EnsaioSondagem');
      processarRegistros(ec.ensaiosTaxaPintura, 'EnsaioTaxaPinturaImprimacao');
      processarRegistros(ec.acompanhamentoCarga, 'AcompanhamentoCarga');
      processarRegistros(ec.ensaiosMRAF, 'EnsaioMRAF');
      processarRegistros(ec.ensaiosManchaPendulo, 'EnsaioManchaPendulo');
      processarRegistros(ec.ensaiosVigaBenkelman, 'EnsaioVigaBenkelman');
      processarRegistros(ec.ensaiosTaxaMRAF, 'EnsaioTaxaMRAF');
      processarRegistros(ec.acompanhamentosUsinagem, 'AcompanhamentoUsinagem');
      processarRegistros(ec.ensaiosGranuIndividual, 'EnsaioGranulometriaIndividual');
      processarRegistros(ec.granuMisturas, 'GranuMistura');
      processarRegistros(ec.ensaiosProctor, 'EnsaioProctor');
      processarRegistros(ec.ensaiosRompimentoConcreto, 'EnsaioRompimentoConcreto');
      processarRegistros(ec.boletinsSondagem, 'BoletimSondagem');
      processarRegistros(ec.boletinsSondagemTrado, 'BoletimSondagemTrado');

      // ── 6. Marcadores manuais de dias ────────────────────────────────────────
      const marcadoresDia = {};
      produtividadeDiaria.forEach(marc => {
        if (!marc.data || !marc.laboratorista_email) return;
        const [y, m, d] = marc.data.split('-').map(Number);
        const marcDate = new Date(y, m - 1, d);
        if (marcDate >= startDate && marcDate <= endDate) {
          const key = `${marc.laboratorista_email.toLowerCase()}_${marcDate.getDate()}`;
          marcadoresDia[key] = marc.status;
        }
      });

      // ── 7. Montar lista de laboratoristas com registros no mês ───────────────
      const emailsComRegistros = new Set(Object.keys(prodData));
      const usersByEmail = Object.fromEntries(allUsers.map(u => [u.email.toLowerCase(), u]));
      const labUsers = Array.from(emailsComRegistros).map(email =>
        usersByEmail[email] || { email, full_name: email, laboratorista_name: email }
      );

      labUsers.forEach(lab => {
        if (!prodData[lab.email.toLowerCase()]) prodData[lab.email.toLowerCase()] = {};
      });

      const labsSorted = labUsers.sort((a, b) =>
        (a.laboratorista_name || a.full_name || '').localeCompare(b.laboratorista_name || b.full_name || '')
      );

      // Salva no cache do mês
      monthCacheRef.current[monthKey] = {
        laboratoristas: labsSorted,
        produtividade: prodData,
        marcadoresDia,
        empreiteiras: empreiteirasArr,
        usinas: usinasArr,
      };

      setLaboratoristas(labsSorted);
      setProdutividade(prodData);
      marcadoresDiaRef.current = marcadoresDia;

    } catch (error) {
      console.error("[Produtividade] Erro ao carregar dados:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  return {
    loading,
    user,
    laboratoristas,
    produtividade,
    empreiteiras,
    usinas,
    marcadoresDiaRef,
    loadData,
  };
}