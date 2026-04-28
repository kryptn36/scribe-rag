import { WarningCircle } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <WarningCircle size={32} className="text-muted-foreground/40" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
