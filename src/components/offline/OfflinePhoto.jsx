/**
 * OfflinePhoto.jsx
 * Componente <img> que resolve referências "local-photo:<id>" para data URLs
 * armazenadas no IndexedDB, permitindo exibir fotos tiradas offline.
 *
 * Uso: <OfflinePhoto src={url} className="..." />
 * - URL normal (http...): renderiza como <img src> normal.
 * - URL "local-photo:<id>": busca base64 do IndexedDB e exibe.
 */

import React, { useState, useEffect } from 'react';
import { isLocalPhotoRef } from '@/services/offlinePhotoService';
import { getOfflinePhoto } from '@/services/offlineStorageService';

export default function OfflinePhoto({ src, className, style, alt, ...rest }) {
  const [displaySrc, setDisplaySrc] = useState(
    isLocalPhotoRef(src) ? null : src
  );

  useEffect(() => {
    if (!isLocalPhotoRef(src)) {
      setDisplaySrc(src);
      return;
    }
    let cancelled = false;
    const photoId = src.replace('local-photo:', '');
    getOfflinePhoto(photoId).then((photo) => {
      if (!cancelled && photo?.base64) {
        setDisplaySrc(photo.base64);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [src]);

  if (!displaySrc) {
    return (
      <div
        className={className}
        style={{ ...style, background: 'var(--color-surface-muted, #f0f0f0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #888)' }}>Carregando...</span>
      </div>
    );
  }

  return <img src={displaySrc} className={className} style={style} alt={alt} {...rest} />;
}