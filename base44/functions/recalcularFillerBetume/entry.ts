import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Apenas administradores podem executar esta função' }, { status: 403 });
    }

    let corrigidos = 0;
    let ignorados = 0;
    let erros = 0;
    let pagina = 0;
    const paginaTamanho = 50;
    let temMais = true;

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    while (temMais) {
      const ensaios = await base44.asServiceRole.entities.EnsaioCAUQ.filter(
        { "extracao_ligante.teor_ligante_real": { "$ne": null } },
        "-created_date",
        paginaTamanho,
        pagina * paginaTamanho
      );

      if (ensaios.length === 0) {
        temMais = false;
        break;
      }

      for (const e of ensaios) {
        try {
          const teorReal = e.extracao_ligante?.teor_ligante_real;
          const amostra = e.extracao_ligante?.amostra_sem_ligante;

          if (!teorReal || !amostra || amostra <= 0) {
            ignorados++;
            continue;
          }

          const pesos = e.granulometria?.peso_retido_peneiras || {};
          const somaRetidos = Object.values(pesos).reduce((s, v) => s + (v || 0), 0);

          const pctPassante200 = ((amostra - somaRetidos) / amostra) * 100;
          const fillerBetume = parseFloat((pctPassante200 / teorReal).toFixed(2));

          await base44.asServiceRole.entities.EnsaioCAUQ.update(e.id, {
            extracao_ligante: {
              ...e.extracao_ligante,
              filler_betume: fillerBetume,
            },
          });

          corrigidos++;
          await delay(500);
        } catch (_err) {
          erros++;
        }
      }

      pagina++;
    }

    return Response.json({
      status: "success",
      corrigidos,
      ignorados,
      erros,
      mensagem: `${corrigidos} registros corrigidos, ${ignorados} ignorados (sem dados), ${erros} erros`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});