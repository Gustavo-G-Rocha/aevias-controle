/**
 * Funções puras para Ensaio Viga Benkelman.
 * Sem side effects, sem chamadas de API.
 * DNIT 006/2003-PRO — Avaliação Estrutural com Viga Benkelman
 */

// ── Estruturas iniciais ────────────────────────────────────────────────────────

export const LADOS_PERMITIDOS = ['bordo_esquerdo', 'eixo', 'bordo_direito'];
export const CAMPOS_LEITURA_PERMITIDOS = ['leitura_inicial', 'leitura_final'];

export const getLevantamentoInicial = (leituraInicialGlobal = '') => ({
  estaca_km: '',
  bordo_esquerdo: { leitura_inicial: leituraInicialGlobal, leitura_final: '', diferenca: 0, deflexao: 0 },
  eixo:          { leitura_inicial: leituraInicialGlobal, leitura_final: '', diferenca: 0, deflexao: 0 },
  bordo_direito: { leitura_inicial: leituraInicialGlobal, leitura_final: '', diferenca: 0, deflexao: 0 },
});

export const getFaixaInicial = (id, leituraInicialGlobal = '') => ({
  id,
  nome: '',
  levantamentos: Array(20).fill(null).map(() => getLevantamentoInicial(leituraInicialGlobal)),
});

export const getInitialForm = () => ({
  obra_id: '',
  project_id: '',
  data_ensaio: new Date().toISOString().split('T')[0],
  data_realizacao: new Date().toISOString().split('T')[0],
  laboratorista_name: '',
  rodovia: '',
  trecho: '',
  material: '',
  procedencia: '',
  camada: '',
  cte_viga: 2,
  def_admissivel: '',
  leitura_inicial_global: '',
  faixas: [getFaixaInicial(1)],
  nextFaixaId: 2,
  controle_estatistico: { qt_leituras: 0, media: 0, desv_pad: 0 },
  observacoes: '',
  status: 'rascunho',
});

// ── Cálculo de lado (deflexão e diferença) ────────────────────────────────────

/**
 * Recalcula diferença e deflexão para um lado após mudança de leitura.
 * @param {object} lado - objeto do lado {leitura_inicial, leitura_final, diferenca, deflexao}
 * @param {string} field - campo alterado ('leitura_inicial' | 'leitura_final')
 * @param {number} numValue - novo valor numérico
 * @param {number|string} cte_viga - constante da viga
 * @returns {object} novo objeto do lado com diferença e deflexão recalculadas
 */
export function calcularLado(lado, field, numValue, cte_viga) {
  if (!CAMPOS_LEITURA_PERMITIDOS.includes(field)) return lado;
  const atualizado = { ...lado, [field]: numValue };
  atualizado.diferenca = (atualizado.leitura_inicial || 0) - (atualizado.leitura_final || 0);
  atualizado.deflexao  = atualizado.diferenca * (parseFloat(cte_viga) || 0.01);
  return atualizado;
}

// ── Reconstrução de faixas a partir de array flat ─────────────────────────────

/**
 * Reconstrói a estrutura de faixas a partir do array flat de levantamentos salvo na API.
 * @param {Array} levamentosFlat - array salvo em ensaio.levantamentos
 * @param {string|number} leituraInicialGlobal - leitura inicial global do ensaio
 * @returns {Array} faixas reconstruídas
 */
export function reconstruirFaixas(levamentosFlat, leituraInicialGlobal) {
  if (!levamentosFlat || levamentosFlat.length === 0) {
    return [getFaixaInicial(1)];
  }

  const faixasMap = {};
  const faixasOrder = [];
  levamentosFlat.forEach(lev => {
    const nome = lev.faixa_nome || 'Faixa 1';
    if (!faixasMap[nome]) {
      faixasMap[nome] = [];
      faixasOrder.push(nome);
    }
    faixasMap[nome].push(lev);
  });

  return faixasOrder.map((nome, idx) => {
    const levsDaFaixa = faixasMap[nome];
    const levantamentos = [...levsDaFaixa];
    while (levantamentos.length < 20) {
      levantamentos.push(getLevantamentoInicial(leituraInicialGlobal || ''));
    }
    return { id: idx + 1, nome, levantamentos };
  });
}

// ── Verificação de dados em faixa ─────────────────────────────────────────────

/**
 * Retorna true se a faixa tiver algum dado preenchido.
 */
export function faixaTemDados(faixa) {
  if (faixa.nome) return true;
  return faixa.levantamentos.some(lev =>
    lev.estaca_km ||
    lev.bordo_esquerdo.leitura_inicial ||
    lev.bordo_esquerdo.leitura_final ||
    lev.eixo.leitura_inicial ||
    lev.eixo.leitura_final ||
    lev.bordo_direito.leitura_inicial ||
    lev.bordo_direito.leitura_final
  );
}

// ── Serialização para salvar ───────────────────────────────────────────────────

/**
 * Converte a estrutura de faixas em array flat para salvar na API.
 * Também detecta se há deflexão excessiva.
 * @param {Array} faixas
 * @param {string|number} def_admissivel
 * @returns {{ levantamentos: Array, temDeflexaoExcessiva: boolean }}
 */
export function serializarFaixas(faixas, def_admissivel) {
  const defAdm = parseFloat(def_admissivel) || 0;
  let temDeflexaoExcessiva = false;
  const levantamentos = [];

  faixas.forEach((faixa) => {
    faixa.levantamentos.forEach((lev) => {
      const deflexoes = [
        lev.bordo_esquerdo.deflexao,
        lev.eixo.deflexao,
        lev.bordo_direito.deflexao,
      ];
      if (defAdm > 0 && deflexoes.some(d => d > defAdm)) {
        temDeflexaoExcessiva = true;
      }
      levantamentos.push({
        faixa_nome: faixa.nome || `Faixa ${faixa.id}`,
        estaca_km: lev.estaca_km || '',
        bordo_esquerdo: {
          leitura_inicial: parseFloat(lev.bordo_esquerdo.leitura_inicial) || 0,
          leitura_final:   parseFloat(lev.bordo_esquerdo.leitura_final)   || 0,
          diferenca:       parseFloat(lev.bordo_esquerdo.diferenca)        || 0,
          deflexao:        parseFloat(lev.bordo_esquerdo.deflexao)         || 0,
        },
        eixo: {
          leitura_inicial: parseFloat(lev.eixo.leitura_inicial) || 0,
          leitura_final:   parseFloat(lev.eixo.leitura_final)   || 0,
          diferenca:       parseFloat(lev.eixo.diferenca)        || 0,
          deflexao:        parseFloat(lev.eixo.deflexao)         || 0,
        },
        bordo_direito: {
          leitura_inicial: parseFloat(lev.bordo_direito.leitura_inicial) || 0,
          leitura_final:   parseFloat(lev.bordo_direito.leitura_final)   || 0,
          diferenca:       parseFloat(lev.bordo_direito.diferenca)        || 0,
          deflexao:        parseFloat(lev.bordo_direito.deflexao)         || 0,
        },
      });
    });
  });

  return { levantamentos, temDeflexaoExcessiva };
}

// ── Filtro de obras ────────────────────────────────────────────────────────────

/**
 * Filtra obras visíveis para o usuário.
 * Admin/sala técnica/gestor veem todas; laboratorista (role=user) só vê da sua regional.
 */
export function filtrarObrasVigaBenkelman(obrasData, regionaisData, userData) {
  const userAccessLevel = userData?.access_level || (userData?.role === 'admin' ? 'admin' : 'user');
  if (userAccessLevel !== 'user') return obrasData;

  const regionalDoLab = regionaisData.find(r =>
    (r.laboratoristas_responsaveis || []).some(
      email => email.toLowerCase() === (userData.email || '').toLowerCase()
    )
  );
  if (!regionalDoLab) return [];
  return obrasData.filter(o => o.regional_id === regionalDoLab.id);
}