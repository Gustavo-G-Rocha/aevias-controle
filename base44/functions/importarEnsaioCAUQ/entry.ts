/**
 * importarEnsaioCAUQ
 * Lê uma planilha XLSX enviada como base64 e cria um EnsaioCAUQ no banco.
 * Payload: { fileBase64: string, obraId: string, projectId?: string }
 *
 * Usa a lib 'xlsx' via esm.sh (bundle menor, sem dependências pesadas).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5?target=deno&no-dts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fileBase64, obraId, projectId } = await req.json();
    if (!fileBase64 || !obraId) {
      return Response.json({ error: 'fileBase64 e obraId são obrigatórios' }, { status: 400 });
    }

    // Decodifica base64 → Uint8Array → workbook
    const binaryStr = atob(fileBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const wb = XLSX.read(bytes, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return Response.json({ error: 'Planilha sem abas' }, { status: 400 });

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const ensaio = parsePlanilha(rows, obraId, projectId);

    const created = await base44.entities.EnsaioCAUQ.create(ensaio);
    return Response.json({ success: true, id: created.id, ensaio: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function n(v) {
  const parsed = parseFloat(String(v).replace(',', '.').replace('%', ''));
  return isNaN(parsed) ? null : parsed;
}

function s(v) {
  const str = String(v ?? '').trim().replace('%', '');
  return str === '' || str === '-' ? null : str;
}

function findRow(rows, keyword) {
  return rows.findIndex(r =>
    r.some(c => String(c).toUpperCase().includes(keyword.toUpperCase()))
  );
}

// Mapa de rótulos da extração (coluna I) → campo da entidade
const EXTRACAO_MAP = {
  'temp. cap':       'temperatura_cap',
  'tipo ligante':    'tipo_ligante',
  'am. c/ lig':      'amostra_com_ligante',
  'am. s/ lig':      'amostra_sem_ligante',
  'fat. corre':      'fator_correcao',
  'peso lig':        'peso_ligante',
  'teor lig. real':  'teor_ligante_real',
  'teor lig':        'teor_ligante',
  'filler/betume':   'filler_betume',
  'umidade':         'umidade',
};

// Mapa ASTM → chave da entidade
const PENEIRA_MAP = {
  '3"': 'peneira_75_0mm', '2½"': 'peneira_63_0mm', '2"': 'peneira_50_0mm',
  '1½"': 'peneira_37_5mm', '1"': 'peneira_25_0mm', '¾"': 'peneira_19_0mm',
  '5/8"': 'peneira_16_0mm', '½"': 'peneira_12_5mm', '3/8"': 'peneira_9_5mm',
  '¼"': 'peneira_6_3mm',
  'nº 4': 'peneira_4_75mm', 'n° 4': 'peneira_4_75mm', 'no 4': 'peneira_4_75mm',
  'nº 8': 'peneira_2_36mm', 'nº 10': 'peneira_2_0mm', 'nº 16': 'peneira_1_18mm',
  'nº 30': 'peneira_0_6mm', 'nº 40': 'peneira_0_42mm', 'nº 50': 'peneira_0_3mm',
  'nº 80': 'peneira_0_18mm', 'nº 100': 'peneira_0_15mm', 'nº 200': 'peneira_0_075mm',
};

// Mapa de rótulos Marshall (coluna A) → campo do corpo de prova
const MARSHALL_MAP = {
  'peso ar':              'peso_ar',
  'peso imerso':          'peso_imerso',
  'peso sss':             'peso_sss',
  'volume':               'volume',
  'densidade aparente':   'densidade_aparente',
  'volume de vazios':     'volume_vazios',
  'v.c.b':                'vcb',
  'v.a.m':                'vam',
  'r.b.v':                'rbv',
  'altura':               'altura',
  'const. prensa':        'const_prensa',
  'leitura rtcd':         'rtcd_leitura',
  'rtcd':                 'rtcd_valor',
  'leitura estab':        'estabilidade_leitura',
  'estabilidade corrig':  'estabilidade_corrigida',
  'fluência':             'fluencia',
  'fluencia':             'fluencia',
};

function matchLabel(cell, map) {
  const norm = String(cell).toLowerCase().trim();
  for (const [key, campo] of Object.entries(map)) {
    if (norm.includes(key)) return campo;
  }
  return null;
}

function normAstm(raw) {
  return String(raw).toLowerCase()
    .replace('nº', 'nº').replace('n°', 'nº').replace('no.', 'nº')
    .replace('no ', 'nº ').trim();
}

function matchAstm(raw) {
  const norm = normAstm(raw);
  for (const [key, campo] of Object.entries(PENEIRA_MAP)) {
    if (norm.includes(key.toLowerCase())) return campo;
  }
  return null;
}

// ─── Parser principal ─────────────────────────────────────────────────────────

function parsePlanilha(rows, obraId, projectId) {
  const ensaio = {
    obra_id: obraId,
    project_id: projectId || null,
    status: 'rascunho',
    realizar_marshall: false,
    realizar_densidade_rice: false,
  };

  // ── Cabeçalho (linha índice 1: obra/rodovia/trecho + data, linha 2: lab/usina/placa) ──
  const cabRow = rows[1] || [];
  const labRow = rows[2] || [];

  const cabStr = String(cabRow[0] || '');
  const rodMatch    = cabStr.match(/rodovia[:\s]+([^|]+)/i);
  const trechoMatch = cabStr.match(/trecho[:\s]+([^|]+)/i);
  if (rodMatch)    ensaio.rodovia = rodMatch[1].trim();
  if (trechoMatch) ensaio.trecho  = trechoMatch[1].trim();

  // Data pode estar na coluna 8 (J) da mesma linha
  for (const cell of [...cabRow]) {
    const dtMatch = String(cell).match(/data[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
    if (dtMatch) {
      const [d, m, y] = dtMatch[1].split('/');
      ensaio.data_ensaio = `${y}-${m}-${d}`;
    }
  }

  const labStr = String(labRow[0] || '');
  const labMatch   = labStr.match(/laboratorista[:\s]+([^|]+)/i);
  const usinaMatch = labStr.match(/usina[:\s]+([^|]+)/i);
  const placaMatch = labStr.match(/placa[:\s]+([^|]+)/i);
  if (labMatch)   ensaio.laboratorista_name = labMatch[1].trim();
  if (usinaMatch) ensaio.usina_fornecedora  = usinaMatch[1].trim();
  if (placaMatch) ensaio.placa_caminhao     = placaMatch[1].trim();

  // ── Granulometria + Extração ───────────────────────────────────────────────
  const granStart = findRow(rows, 'PENEIRAS ASTM');
  const pesoRetido = {};
  const extracao = {
    amostra_com_ligante: null, amostra_sem_ligante: null,
    fator_correcao: 1.0, peso_ligante: null,
    teor_ligante: null, filler_betume: null, teor_ligante_real: null,
    umidade: null, amostra_umida: null, amostra_seca: null,
  };

  if (granStart >= 0) {
    for (let i = granStart + 1; i < rows.length; i++) {
      const row = rows[i];
      const colA = String(row[0] || '').trim();

      // Parar ao entrar em seção Marshall/Rice/Observações
      if (
        colA.toUpperCase().includes('MARSHALL') ||
        colA.toUpperCase().includes('RICE') ||
        colA.toUpperCase().includes('OBSERVAÇ')
      ) break;

      // Granulometria: coluna A = peneira ASTM, coluna B (índice 1) = retido
      const chaveAstm = matchAstm(colA);
      if (chaveAstm) {
        const retido = n(row[1]);
        if (retido !== null) pesoRetido[chaveAstm] = retido;
      }

      // Extração: coluna I (índice 8) = label, coluna J (índice 9) = valor
      const labelExt = String(row[8] || '').trim();
      if (labelExt) {
        const campoExt = matchLabel(labelExt, EXTRACAO_MAP);
        if (campoExt) {
          const val = row[9] ?? '';
          if (campoExt === 'tipo_ligante') {
            extracao[campoExt] = s(val);
          } else if (campoExt === 'temperatura_cap') {
            ensaio.temperatura_cap = n(val);
          } else {
            extracao[campoExt] = n(val) ?? s(val);
          }
        }
        // Tipo ligante (linha "TIPO LIGANTE")
        if (labelExt.toLowerCase().includes('tipo ligante')) {
          ensaio.tipo_ligante = s(row[9]);
        }
      }
    }
  }

  ensaio.granulometria     = { peso_retido_peneiras: pesoRetido };
  ensaio.extracao_ligante  = extracao;

  // ── Marshall ──────────────────────────────────────────────────────────────
  const marshallStart = findRow(rows, 'ENSAIO MARSHALL');
  if (marshallStart >= 0) {
    ensaio.realizar_marshall = true;
    const cps = Array.from({ length: 6 }, (_, i) => ({ numero: i + 1 }));

    for (let i = marshallStart + 2; i < rows.length; i++) {
      const row = rows[i];
      const label = String(row[0] || '').trim();

      if (
        label.toUpperCase().includes('RICE') ||
        label.toUpperCase().includes('OBSERVAÇ')
      ) break;

      const campo = matchLabel(label, MARSHALL_MAP);
      if (campo) {
        for (let cp = 0; cp < 6; cp++) {
          const val = n(row[2 + cp]);
          if (val !== null) cps[cp][campo] = val;
        }
      }
    }

    ensaio.corpos_prova_marshall = cps.filter(cp =>
      cp.peso_ar || cp.densidade_aparente || cp.rtcd_valor || cp.estabilidade_corrigida
    );
  }

  // ── Densidade Rice ────────────────────────────────────────────────────────
  const riceStart = findRow(rows, 'DENSIDADE RICE');
  if (riceStart >= 0 && ensaio.realizar_marshall) {
    ensaio.realizar_densidade_rice = true;
    const riceRow = rows[riceStart + 1] || [];
    const riceMap = {
      'fr+água': 'frasco_agua', 'amostra': 'amostra', 'fr+água+am': 'frasco_agua_amostra',
      'temp. água': 'temperatura_agua', 'dens. água': 'densidade_agua', 'dens. rice': 'densidade_rice',
    };
    const rice = {};
    for (let c = 0; c + 1 < riceRow.length; c += 2) {
      const lbl = String(riceRow[c] || '').toLowerCase();
      const campo = matchLabel(lbl, riceMap);
      if (campo) rice[campo] = n(riceRow[c + 1]);
    }
    ensaio.densidade_rice = rice;
  }

  // ── Observações ───────────────────────────────────────────────────────────
  const obsStart = findRow(rows, 'OBSERVAÇÕES');
  if (obsStart >= 0 && rows[obsStart + 1]) {
    ensaio.observacoes = s(rows[obsStart + 1][0]) || null;
  }

  return ensaio;
}