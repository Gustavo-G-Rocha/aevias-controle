/**
 * Calcula estatísticas básicas (quantidade, média, desvio padrão) para um array de deflexões
 */
export function calcularEstatisticas(deflexoes) {
  const qt = deflexoes.length;
  const media = qt > 0 ? deflexoes.reduce((a, b) => a + b) / qt : 0;
  const desvPad = qt > 0
    ? Math.sqrt(deflexoes.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / qt)
    : 0;
  return { qt, media, desvPad };
}

/**
 * Calcula estatísticas por bordo (esquerdo, eixo, direito) a partir de levantamentos
 */
export function calcularEstatisticasPorFaixa(levantamentos) {
  const bordoEsquerdo = levantamentos.map(lev => lev.bordo_esquerdo?.deflexao || 0).filter(v => v > 0);
  const eixo = levantamentos.map(lev => lev.eixo?.deflexao || 0).filter(v => v > 0);
  const bordoDireito = levantamentos.map(lev => lev.bordo_direito?.deflexao || 0).filter(v => v > 0);
  return {
    bordoEsquerdo: calcularEstatisticas(bordoEsquerdo),
    eixo: calcularEstatisticas(eixo),
    bordoDireito: calcularEstatisticas(bordoDireito)
  };
}

/**
 * Formata data no padrão pt-BR
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Agrupa levantamentos por faixa
 * Prioriza campo faixa_nome se preenchido e distinto; caso contrário, agrupa em blocos de 20
 */
export function agruparLevantamentosPorFaixa(levantamentos, maxFaixas = 4) {
  const levs = levantamentos || [];
  
  if (levs.length === 0) return [];

  // Filtrar apenas levantamentos com dados reais
  const levsFiltrados = levs.filter(lev => temDadosLevantamento(lev));
  if (levsFiltrados.length === 0) return [];

  const todosTemFaixaNome = levsFiltrados.every(l => l.faixa_nome);
  const todasIguais = todosTemFaixaNome && levsFiltrados.every(l => l.faixa_nome === levsFiltrados[0].faixa_nome);

  let faixasArray;
  
  if (todosTemFaixaNome && !todasIguais) {
    // Agrupar pelo campo faixa_nome
    const faixasMap = {};
    const faixasOrder = [];
    levsFiltrados.forEach(lev => {
      const nome = lev.faixa_nome;
      if (!faixasMap[nome]) {
        faixasMap[nome] = [];
        faixasOrder.push(nome);
      }
      faixasMap[nome].push(lev);
    });
    faixasArray = faixasOrder.map(nome => ({ nome, levantamentos: faixasMap[nome] })).slice(0, maxFaixas);
  } else {
    // Agrupar em blocos de 20 (compatibilidade com dados antigos)
    const blocoSize = 20;
    const numBlocos = Math.ceil(levsFiltrados.length / blocoSize);
    faixasArray = [];
    for (let i = 0; i < numBlocos && i < maxFaixas; i++) {
      const bloco = levsFiltrados.slice(i * blocoSize, (i + 1) * blocoSize);
      const nome = bloco.find(l => l.faixa_nome)?.faixa_nome || `Faixa ${i + 1}`;
      faixasArray.push({ nome, levantamentos: bloco });
    }
  }

  return faixasArray;
}

/**
 * Prepara dados para o gráfico de uma faixa
 */
export function prepararChartData(levantamentos, defAdmissivel) {
  const levantamentosComDados = levantamentos.filter(lev =>
    lev.estaca_km || lev.bordo_esquerdo?.deflexao || lev.eixo?.deflexao || lev.bordo_direito?.deflexao
  );
  
  const defAdmissivelParsed = parseFloat(defAdmissivel) || 0;
  
  return levantamentosComDados.map(lev => ({
    estaca: lev.estaca_km || '',
    'Bordo Esquerdo': lev.bordo_esquerdo?.deflexao || 0,
    'Eixo': lev.eixo?.deflexao || 0,
    'Bordo Direito': lev.bordo_direito?.deflexao || 0,
    'Def. Admissível': defAdmissivelParsed
  }));
}

/**
 * Verifica se deflexão excede limite admissível
 */
export function deflexaoExcedeLimite(deflexao, defAdmissivel) {
  const admissivel = parseFloat(defAdmissivel) || 0;
  return admissivel > 0 && deflexao > admissivel;
}

/**
 * Valida se levantamento tem dados
 */
export function temDadosLevantamento(lev) {
  if (!lev) return false;
  return !!(
    lev.estaca_km || 
    (lev.bordo_esquerdo?.leitura_final && lev.bordo_esquerdo.leitura_final !== 0) ||
    (lev.eixo?.leitura_final && lev.eixo.leitura_final !== 0) ||
    (lev.bordo_direito?.leitura_final && lev.bordo_direito.leitura_final !== 0)
  );
}