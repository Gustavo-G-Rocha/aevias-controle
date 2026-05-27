/**
 * Hook de cálculos derivados para EnsaioLimites.
 * Centraliza todos os useMemo de cálculos complexos.
 */
import { useMemo } from 'react';
import { getDataEnsaio } from '@/components/ensaios/ensaioMappers';
import {
  calcUmidade,
  calcLLRow,
  calcLPRow,
  fitLogLine,
  normalizeNumber,
  calcIndexGroup,
  classificarHRB,
} from '@/utils/ensaioLimitesUtils';

export function useEnsaioLimitesData(data) {
  // ─── Umidade Higroscópica ───
  const higroTeor1 = useMemo(() =>
    calcUmidade(data.higro_solo_umido_capsula_1, data.higro_solo_seco_capsula_1, data.higro_peso_capsula_1),
    [data.higro_solo_umido_capsula_1, data.higro_solo_seco_capsula_1, data.higro_peso_capsula_1]
  );

  const higroTeor2 = useMemo(() =>
    calcUmidade(data.higro_solo_umido_capsula_2, data.higro_solo_seco_capsula_2, data.higro_peso_capsula_2),
    [data.higro_solo_umido_capsula_2, data.higro_solo_seco_capsula_2, data.higro_peso_capsula_2]
  );

  const higroTeorMedia = useMemo(() => {
    const valid = [higroTeor1, higroTeor2].filter(v => v != null);
    return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(2)) : null;
  }, [higroTeor1, higroTeor2]);

  // ─── LL rows ───
  const llCalc = useMemo(() => (data.ll_rows || []).map(calcLLRow), [data.ll_rows]);

  // ─── LP ───
  const lpTeors = useMemo(() => (data.lp_rows || []).map(r => calcLPRow(r)), [data.lp_rows]);

  const lpMedia = useMemo(() => {
    const valid = lpTeors.filter(v => v != null);
    return valid.length > 0 ? parseFloat((valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1)) : null;
  }, [lpTeors]);

  // ─── LL curve ───
  const llPoints = useMemo(() =>
    (data.ll_rows || []).map((r, i) => ({
      x: parseFloat(r.num_golpes),
      y: llCalc[i].teor,
    })).filter(p => p.x > 0 && p.y != null),
    [data.ll_rows, llCalc]
  );

  const llYAxisDomain = useMemo(() => {
    if (llPoints.length === 0) return ['auto', 'auto'];
    const yValues = llPoints.map(p => p.y).filter(y => y != null);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    return [parseFloat((minY - 5).toFixed(2)), parseFloat((maxY + 5).toFixed(2))];
  }, [llPoints]);

  const llFit = useMemo(() => fitLogLine(llPoints), [llPoints]);

  const llCurve = useMemo(() => {
    if (!llFit) return [];
    const xs = llPoints.map(p => p.x);
    const minX = Math.max(1, Math.min(...xs) - 2);
    const maxX = Math.max(...xs) + 2;
    return [
      { x: minX, y: parseFloat((llFit.a * minX + llFit.b).toFixed(2)) },
      { x: maxX, y: parseFloat((llFit.a * maxX + llFit.b).toFixed(2)) },
    ];
  }, [llFit, llPoints]);

  // ─── Granulometria Grossa ───
  const granGrossaRetidos = useMemo(() => {
    return (data.peneiras_grossas || []).map(pen => normalizeNumber(pen.retido) || 0);
  }, [data.peneiras_grossas]);

  const granGrossaCalc = useMemo(() => {
    const retidos = granGrossaRetidos;
    const totalSeca = normalizeNumber(data.amostra_total_seca) || null;
    if (!totalSeca || totalSeca <= 0) return [];
    let acumPassando = totalSeca;
    return retidos.map(retido => {
      const passando = parseFloat((acumPassando - retido).toFixed(3));
      const passPct = parseFloat((passando / totalSeca * 100).toFixed(1));
      acumPassando = passando;
      return { retido, passando, passPct };
    });
  }, [granGrossaRetidos, data.amostra_total_seca]);

  // ─── Granulometria Fina ───
  const amostParcSeca = normalizeNumber(data.amostra_parcial_seca);

  const granFinaCalc = useMemo(() => {
    if (!amostParcSeca || amostParcSeca <= 0) return [];
    let acum = amostParcSeca;
    return (data.peneiras_finas || []).map(pen => {
      const retido = normalizeNumber(pen.retido) || 0;
      const passando = parseFloat((acum - retido).toFixed(3));
      const passPct = parseFloat((passando / amostParcSeca * 100).toFixed(1));
      acum = passando;
      return { retido, passando, passPct };
    });
  }, [data.peneiras_finas, amostParcSeca]);

  // ─── SP10 e campos calculados ───
  const amostraTotalSecaAuto = useMemo(() => {
    const ut = normalizeNumber(data.amostra_total_umida);
    if (ut == null || higroTeorMedia == null) return null;
    return parseFloat((ut / (1 + higroTeorMedia / 100)).toFixed(3));
  }, [data.amostra_total_umida, higroTeorMedia]);

  const amostraTotalSeca = amostraTotalSecaAuto || normalizeNumber(data.amostra_total_seca);

  const soloSecoRetido10 = useMemo(() => {
    if (!granGrossaRetidos.length) return null;
    const total = granGrossaRetidos.reduce((s, r) => s + r, 0);
    return total > 0 ? parseFloat(total.toFixed(3)) : null;
  }, [granGrossaRetidos]);

  const soloUmPassando10 = useMemo(() => {
    const ut = normalizeNumber(data.amostra_total_umida);
    if (!ut || !granGrossaRetidos.length) return null;
    const totalRetidoUmido = granGrossaRetidos.reduce((s, r) => s + r, 0);
    const result = parseFloat((ut - totalRetidoUmido).toFixed(3));
    return result > 0 ? result : null;
  }, [data.amostra_total_umida, granGrossaRetidos]);

  const sp10 = useMemo(() => {
    if (soloUmPassando10 == null || higroTeorMedia == null) return null;
    return parseFloat((soloUmPassando10 / (higroTeorMedia / 100 + 1)).toFixed(3));
  }, [soloUmPassando10, higroTeorMedia]);

  const amostraTotalSecaCalc = useMemo(() => {
    if (soloSecoRetido10 == null || sp10 == null) return null;
    return parseFloat((soloSecoRetido10 + sp10).toFixed(3));
  }, [soloSecoRetido10, sp10]);

  // ─── Índices ───
  const IP = useMemo(() => {
    if (llFit?.ll == null || lpMedia == null) return null;
    return parseFloat((llFit.ll - lpMedia).toFixed(1));
  }, [llFit, lpMedia]);

  const pct200 = useMemo(() => {
    if (!granFinaCalc.length || !amostraTotalSeca || sp10 == null || amostParcSeca == null || amostParcSeca <= 0) return null;
    const passando200 = granFinaCalc[granFinaCalc.length - 1]?.passando || 0;
    return parseFloat(((passando200 / amostParcSeca) * (sp10 / amostraTotalSeca) * 100).toFixed(1));
  }, [granFinaCalc, amostraTotalSeca, sp10, amostParcSeca]);

  const igCalc = useMemo(() => {
    return calcIndexGroup(pct200, llFit?.ll ?? null, IP);
  }, [pct200, llFit, IP]);

  // ─── Granulometria percentuais ───
  const pctPedregulho = useMemo(() => {
    if (!amostraTotalSeca || !granGrossaCalc.length) return null;
    const retido3_8 = granGrossaCalc.slice(0, 4).reduce((s, r) => s + r.retido, 0);
    return parseFloat((retido3_8 / amostraTotalSeca * 100).toFixed(1));
  }, [granGrossaCalc, amostraTotalSeca]);

  const pctAreiaGrossaMedia = useMemo(() => {
    if (!amostraTotalSeca || !granGrossaCalc.length) return null;
    const retido4e10 = (granGrossaCalc[4]?.retido || 0) + (granGrossaCalc[5]?.retido || 0);
    return parseFloat((retido4e10 / amostraTotalSeca * 100).toFixed(1));
  }, [granGrossaCalc, amostraTotalSeca]);

  const pctAreiaFina = useMemo(() => {
    if (!amostParcSeca || !granFinaCalc.length || !amostraTotalSeca) return null;
    const retido40 = granFinaCalc[0]?.retido || 0;
    if (sp10 == null) return null;
    const pctSP10 = sp10 / amostraTotalSeca;
    const retido40pct = (retido40 / amostParcSeca) * pctSP10 * 100;
    return parseFloat(retido40pct.toFixed(1));
  }, [granFinaCalc, amostParcSeca, amostraTotalSeca, sp10]);

  const pctSilteArgila = useMemo(() => {
    if (!granFinaCalc.length || !amostraTotalSeca || sp10 == null || amostParcSeca == null || amostParcSeca <= 0) return null;
    const passando200 = granFinaCalc[granFinaCalc.length - 1]?.passando || 0;
    const pct = (passando200 / amostParcSeca) * (sp10 / amostraTotalSeca) * 100;
    return parseFloat(pct.toFixed(1));
  }, [granFinaCalc, amostraTotalSeca, sp10, amostParcSeca]);

  const pct10 = useMemo(() => {
    if (!granGrossaCalc.length || !amostraTotalSeca) return null;
    const passando10 = granGrossaCalc[5]?.passando;
    if (passando10 == null) return null;
    return parseFloat((passando10 / amostraTotalSeca * 100).toFixed(1));
  }, [granGrossaCalc, amostraTotalSeca]);

  const pct40 = useMemo(() => {
    if (!granFinaCalc.length || !amostraTotalSeca || sp10 == null || amostParcSeca == null || amostParcSeca <= 0) return null;
    const passando40 = granFinaCalc[0]?.passando;
    if (passando40 == null) return null;
    return parseFloat(((passando40 / amostParcSeca) * (sp10 / amostraTotalSeca) * 100).toFixed(1));
  }, [granFinaCalc, amostParcSeca, amostraTotalSeca, sp10]);

  const classificacaoHRB = useMemo(() => {
    if (pct200 == null) return "-";
    return classificarHRB(pct10, pct40, pct200, llFit?.ll ?? null, IP, igCalc);
  }, [pct10, pct40, pct200, llFit, IP, igCalc]);

  return {
    higroTeor1,
    higroTeor2,
    higroTeorMedia,
    llCalc,
    lpTeors,
    lpMedia,
    llPoints,
    llYAxisDomain,
    llFit,
    llCurve,
    granGrossaRetidos,
    granGrossaCalc,
    granFinaCalc,
    amostraTotalSecaAuto,
    amostraTotalSeca,
    soloSecoRetido10,
    soloUmPassando10,
    sp10,
    amostraTotalSecaCalc,
    IP,
    pct200,
    igCalc,
    pctPedregulho,
    pctAreiaGrossaMedia,
    pctAreiaFina,
    pctSilteArgila,
    pct10,
    pct40,
    classificacaoHRB,
  };
}