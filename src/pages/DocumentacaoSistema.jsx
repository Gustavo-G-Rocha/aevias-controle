import React, { useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { ShieldAlert, DownloadCloud, Loader2, BookOpen } from 'lucide-react';
import DocFolderSection from '@/components/docs/DocFolderSection';
import { getDocsByFolder, FOLDER_LABELS, FOLDER_ORDER, buildBundle, downloadText } from '@/components/docs/docsRegistry';

export default function DocumentacaoSistema() {
  const { user, isLoadingAuth } = useAuth();
  const [busyAll, setBusyAll] = useState(false);
  const groups = useMemo(() => getDocsByFolder(), []);

  if (isLoadingAuth) return <LoadingState />;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-10 w-10" style={{ color: 'var(--color-danger)' }} />
        <p className="font-medium" style={{ color: 'var(--color-text)' }}>Acesso restrito</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Esta área é exclusiva do administrador do sistema.</p>
      </div>
    );
  }

  const folders = FOLDER_ORDER.filter((key) => groups[key]?.length);
  const totalFiles = folders.reduce((sum, key) => sum + groups[key].length, 0);

  const baixarTudo = async () => {
    setBusyAll(true);
    const allFiles = folders.flatMap((key) => groups[key]);
    downloadText('documentacao-completa-do-sistema.md', await buildBundle(allFiles));
    setBusyAll(false);
  };

  return (
    <div className="p-6 min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <BookOpen className="h-6 w-6" style={{ color: 'var(--color-secondary)' }} />
              Documentação do Sistema
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{totalFiles} documentos em src/docs</p>
          </div>
          <Button onClick={baixarTudo} disabled={busyAll}>
            {busyAll ? <Loader2 className="animate-spin" /> : <DownloadCloud />}
            Baixar todos os documentos
          </Button>
        </div>

        {folders.map((key) => (
          <DocFolderSection key={key} folderKey={key} title={FOLDER_LABELS[key] || key} files={groups[key]} />
        ))}
      </div>
    </div>
  );
}