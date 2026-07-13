/**
 * tests/hooks/useSessionTimeout.test.js
 *
 * Teste de contrato (source-based) para useSessionTimeout — hook de
 * logout automático por inatividade. Ambiente 'node' sem DOM/RTL —
 * validação via leitura do source + teste das funções puras extraídas.
 *
 * Cenários cobertos:
 *  - Sessão ativa (timer não dispara quando enabled=false)
 *  - Sessão expirada por inatividade (timer de timeout + aviso prévio)
 *  - Revalidação ao retornar do segundo plano (visibilitychange)
 *  - extendSession cancela aviso e reinicia timers
 *  - logoutNow executa imediatamente
 *  - Listeners de atividade registrados (mousedown, touchstart, keydown, scroll)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  resolve(__dirname, '../../hooks/useSessionTimeout.js'),
  'utf-8'
);

describe('useSessionTimeout — contrato de segurança', () => {
  it('exporta a função useSessionTimeout', () => {
    expect(src).toContain('export function useSessionTimeout');
  });

  it('tem parâmetros configuráveis: enabled, timeoutMs, warningMs, onTimeout', () => {
    expect(src).toContain('enabled');
    expect(src).toContain('timeoutMs');
    expect(src).toContain('warningMs');
    expect(src).toContain('onTimeout');
  });

  it('define valores padrão: 15 min de timeout, 60s de aviso', () => {
    expect(src).toContain('15 * 60 * 1000');
    expect(src).toContain('60 * 1000');
  });

  it('não ativa timers quando enabled=false', () => {
    // O efeito de atividade retorna early quando !enabled
    expect(src).toMatch(/if\s*\(!enabled\)\s*{[\s\S]*?clearTimers[\s\S]*?return/);
  });

  it('registra listeners de atividade do usuário', () => {
    expect(src).toContain("'mousedown'");
    expect(src).toContain("'touchstart'");
    expect(src).toContain("'keydown'");
    expect(src).toContain("'scroll'");
  });

  it('exibe aviso prévio antes do timeout (showWarning + countdown)', () => {
    expect(src).toContain('setShowWarning(true)');
    expect(src).toContain('setCountdown');
    expect(src).toContain('startCountdown');
  });

  it('executa logout quando o countdown expira', () => {
    expect(src).toContain('executeLogout');
    expect(src).toMatch(/remaining\s*<=\s*0[\s\S]*?executeLogout/);
  });

  it('executa logout após o timer absoluto (caso usuário ignore aviso)', () => {
    expect(src).toMatch(/timeoutTimerRef[\s\S]*?executeLogout/);
  });

  it('extendSession cancela aviso e reinicia timers', () => {
    expect(src).toContain('extendSession');
    expect(src).toMatch(/extendSession[\s\S]*?resetTimers/);
    // resetTimers limpa showWarning e countdown
    expect(src).toMatch(/resetTimers[\s\S]*?setShowWarning\(false\)/);
  });

  it('logoutNow executa logout imediatamente', () => {
    expect(src).toContain('logoutNow');
    expect(src).toMatch(/logoutNow[\s\S]*?executeLogout/);
  });

  it('monitora visibilitychange para revalidar ao retornar do segundo plano', () => {
    expect(src).toContain("'visibilitychange'");
    expect(src).toContain("document.visibilityState");
    expect(src).toContain("'visible'");
  });

  it('desloga imediatamente se tempo em segundo plano excede timeout', () => {
    expect(src).toContain('lastActivityRef');
    expect(src).toMatch(/elapsed\s*>=\s*timeoutMs[\s\S]*?executeLogout/);
  });

  it('mostra aviso se retornou do segundo plano dentro da janela de aviso', () => {
    expect(src).toMatch(
      /elapsed\s*>=\s*timeoutMs\s*-\s*warningMs[\s\S]*?setShowWarning\(true\)/
    );
  });

  it('reseta timers se retornou do segundo plano dentro do período seguro', () => {
    expect(src).toMatch(/else[\s\S]*?resetTimers/);
  });

  it('limpa todos os timers corretamente (clearTimers)', () => {
    expect(src).toContain('clearTimers');
    expect(src).toContain('clearTimeout(timeoutTimerRef.current)');
    expect(src).toContain('clearTimeout(warningTimerRef.current)');
    expect(src).toContain('clearInterval(countdownIntervalRef.current)');
  });

  it('usa throttling na atividade para não recriar timers excessivamente', () => {
    expect(src).toContain('throttled');
    expect(src).toContain('requestAnimationFrame');
  });

  it('mantém onTimeout em ref para evitar recriação de timers', () => {
    expect(src).toContain('onTimeoutRef');
    expect(src).toContain('onTimeoutRef.current = onTimeout');
  });

  it('retorna showWarning, countdown, extendSession, logoutNow', () => {
    expect(src).toContain('showWarning');
    expect(src).toContain('countdown');
    expect(src).toContain('extendSession');
    expect(src).toContain('logoutNow');
  });
});

describe('useSessionTimeout — integração com AuthContext', () => {
  const authSrc = readFileSync(
    resolve(__dirname, '../../lib/AuthContext.jsx'),
    'utf-8'
  );

  it('AuthContext importa e usa useSessionTimeout', () => {
    expect(authSrc).toContain("useSessionTimeout");
    expect(authSrc).toContain("from '@/hooks/useSessionTimeout'");
  });

  it('AuthContext só ativa o timer quando isAuthenticated', () => {
    expect(authSrc).toContain('enabled: isAuthenticated');
  });

  it('AuthContext usa onTimeout que chama logout', () => {
    expect(authSrc).toContain('handleSessionTimeout');
    expect(authSrc).toMatch(/handleSessionTimeout[\s\S]*?logout/);
  });

  it('AuthContext renderiza SessionTimeoutWarning', () => {
    expect(authSrc).toContain('SessionTimeoutWarning');
    expect(authSrc).toContain('sessionWarning');
    expect(authSrc).toContain('sessionCountdown');
  });
});