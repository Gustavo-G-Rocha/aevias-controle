import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '@/utils/logger';

describe('logger — gate de produção', () => {
  afterEach(() => vi.restoreAllMocks());

  it('não expõe argumentos no console quando desabilitado', () => {
    const spies = [
      vi.spyOn(console, 'log').mockImplementation(() => {}),
      vi.spyOn(console, 'error').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}),
      vi.spyOn(console, 'info').mockImplementation(() => {}),
    ];
    const productionLogger = createLogger(false);
    const sensitiveData = { payload: 'dado-sensivel', recordId: 'registro-123' };

    productionLogger.log(sensitiveData);
    productionLogger.error(sensitiveData);
    productionLogger.warn(sensitiveData);
    productionLogger.info(sensitiveData);

    spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
  });

  it('mantém os logs disponíveis quando explicitamente habilitado', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const developmentLogger = createLogger(true);

    developmentLogger.log('diagnóstico local');

    expect(logSpy).toHaveBeenCalledWith('diagnóstico local');
  });
});