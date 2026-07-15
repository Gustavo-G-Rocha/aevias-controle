import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const homeSource = readFileSync(resolve(root, 'pages/Home.jsx'), 'utf-8');

describe('Home — reutilização da autenticação', () => {
  it('reutiliza o usuário do AuthContext', () => {
    expect(homeSource).toContain("import { useAuth } from '@/lib/AuthContext'");
    expect(homeSource).toContain('const { user } = useAuth();');
  });

  it('não repete a consulta ao usuário autenticado', () => {
    expect(homeSource).not.toContain('base44.auth.me()');
  });

  it('preserva os destinos por perfil', () => {
    expect(homeSource).toContain("createPageUrl('Dashboard')");
    expect(homeSource).toContain("createPageUrl('MeusEnsaios')");
  });
});