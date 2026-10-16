'use client';

import React, { useEffect } from 'react';

export const ModalWrapper = ({
  children,
  maxWidth = 760,
  onClose,
}: {
  children: React.ReactNode;
  maxWidth?: number;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mc"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {children}
      </div>
    </div>
  );
};
