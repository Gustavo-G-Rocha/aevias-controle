import { describe, it, expect } from 'vitest';
import { MAX_UPLOAD_WIDTH, UPLOAD_QUALITY } from '@/constants/imageConfig';

describe('imageConfig', () => {
  it('define a dimensão de upload reduzida para 1280px', () => {
    expect(MAX_UPLOAD_WIDTH).toBe(1280);
  });

  it('mantém a qualidade JPEG de upload em 0.82', () => {
    expect(UPLOAD_QUALITY).toBe(0.82);
  });
});