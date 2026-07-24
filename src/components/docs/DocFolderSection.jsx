import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FolderDown, FileText, Loader2 } from 'lucide-react';
import { downloadText, buildBundle } from '@/components/docs/docsRegistry';

export default function DocFolderSection({ title, folderKey, files }) {
  const [busy, setBusy] = useState(null);

  const baixarArquivo = async (file) => {
    setBusy(file.rel);
    downloadText(file.name, await file.loader());
    setBusy(null);
  };

  const baixarPasta = async () => {
    setBusy('__folder__');
    downloadText(`docs-${folderKey}.md`, await buildBundle(files));
    setBusy(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          {title}
          <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>({files.length} arquivo{files.length > 1 ? 's' : ''})</span>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={baixarPasta} disabled={busy !== null}>
          {busy === '__folder__' ? <Loader2 className="animate-spin" /> : <FolderDown />}
          Baixar pasta
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {files.map((file) => (
          <div key={file.rel} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0" style={{ color: 'var(--color-secondary)' }} />
              <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{file.rel}</span>
            </div>
            <Button size="sm" variant="ghost" className="h-8 shrink-0" onClick={() => baixarArquivo(file)} disabled={busy !== null}>
              {busy === file.rel ? <Loader2 className="animate-spin" /> : <Download />}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}