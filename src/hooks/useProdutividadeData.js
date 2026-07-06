import { useState, useCallback, useEffect, useRef } from "react";
import { obterUsuarioAtual, listarUsuarios } from "@/services/usuariosService";
import { listarRegionais } from "@/services/regionaisService";
import { listarObrasRecentes } from "@/services/obrasService";
import { listarProdutividade } from "@/services/produtividadeService";
import { loadRecordsGrouped } from "@/services/recordsService";
import { logger } from '@/utils/logger';

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

export function useProdutividadeData(currentMonth) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [laboratoristas, setLaboratoristas] = useState([]);
  const [produtividade, setProdutividade] = useState({});
  const [empreiteiras, setEmpreiteiras] = useState([]);
  const [usinas, setUsinas] = useState([]);
  const marcadoresDiaRef = useRef({});

  const entityCacheRef = useRef(null);
  const monthCacheRef = useRef({});

  const loadData = useCallback(async (force = true) => {
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

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
      const currentUser = await obterUsuarioAtual();
      setUser(currentUser);

      const userAccessLevel = currentUser?.access_level || (currentUser?.role === 'admin' ? 'admin' : 'user');
      const isAdmin = userAccessLevel === 'admin';

      const [regionais, allUsers, obras] = await Promise.all([
        listarRegionais(),
        listarUsuarios(),
        listarObrasRecentes()
      ]);

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

      if (force || !entityCacheRef.current) {
        const lote1 = await loadRecordsGrouped([
          'DiarioObra', 'ChecklistUsina', 'ChecklistAplicacao', 'ChecklistMRAF',
          'ChecklistConcretagem', 'ChecklistTerraplanagem', 'ChecklistReciclagem', 'EnsaioCAUQ',
        ], 500);

        const lote2 = await loadRecordsGrouped([
          'EnsaioDensidade', 'EnsaioDensidadeInSitu', 'EnsaioSondagem', 'EnsaioTaxaPinturaImprimacao',
          'AcompanhamentoCarga', 'EnsaioMRAF', 'EnsaioManchaPendulo', 'EnsaioVigaBenkelman',
        ], 500);

        const lote3 = await loadRecordsGrouped([
          'EnsaioTaxaMRAF', 'AcompanhamentoUsinagem', 'EnsaioGranulometriaIndividual', 'GranuMistura',
          'EnsaioProctor', 'EnsaioRompimentoConcreto', 'BoletimSondagem', 'BoletimSondagemTrado',
        ], 500);

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

      const produtividadeDiaria = await listarProdutividade();

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const todayLocal = new Date();
      const isViewingCurrentMonth =
        currentMonth.getFullYear() === todayLocal.getFullYear() &&
        currentMonth.getMonth() === todayLocal.getMonth();
      const endDate = isViewingCurrentMonth
        ? new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate())
        : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

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
      logger.error("[Produtividade] Erro ao carregar dados:", error?.message || error);
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