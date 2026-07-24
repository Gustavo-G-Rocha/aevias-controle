import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf-8');

const confirmationFlows = [
  'pages/MeusEnsaios.jsx',
  'components/ensaios/ClienteInterface.jsx',
  'components/ensaios/EnsaioCard.jsx',
  'hooks/useEnsaiosActions.js',
];

describe('confirmações acessíveis de ações críticas', () => {
  it('não utiliza window.confirm nos fluxos de assinatura e aprovação', () => {
    confirmationFlows.forEach((path) => expect(read(path)).not.toContain('window.confirm'));
  });

  it('usa AlertDialog com título, descrição, cancelamento e ação explícita', () => {
    const dialog = read('components/ensaios/CriticalActionDialog.jsx');
    expect(dialog).toContain('<AlertDialogTitle>{title}</AlertDialogTitle>');
    expect(dialog).toContain('<AlertDialogDescription>{description}</AlertDialogDescription>');
    expect(dialog).toContain('<AlertDialogCancel>Cancelar</AlertDialogCancel>');
    expect(dialog).toContain('<AlertDialogAction onClick={onConfirm}>');
  });

  it('mantém o texto de confirmação legal da assinatura', () => {
    // O texto de confirmação foi centralizado em constants/ensaioUi.js
    // (buildSignDescription) — os consumidores importam a partir de lá.
    expect(read('constants/ensaioUi.js')).toContain('Confirma a assinatura digital do registro');
    ['components/ensaios/EnsaioCard.jsx', 'components/ensaios/TableRowCliente.jsx', 'components/ensaios/TableRowAdmin.jsx']
      .forEach((path) => expect(read(path)).toContain('buildSignDescription'));
  });
});