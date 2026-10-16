'use client';

import { openDocPreview } from '@/lib/admin/doc-preview';
import { Icon } from './Icon';

export const DocButton = ({ fileName }: { fileName: string }) => (
  <button
    type="button"
    className="doc"
    onClick={() => openDocPreview(fileName)}
    title="Buka di tab baru"
  >
    <Icon name="file" />
    <span>{fileName}</span>
    <Icon name="ext" />
  </button>
);
