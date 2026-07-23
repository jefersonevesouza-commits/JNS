import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MobileHeader — shared header for all pages.
 * Uses safe-area-inset-top for notch support.
 * When `onBack` is provided (or `showBack` is true), renders a back button.
 */
export default function MobileHeader({ title, subtitle, onBack, showBack = false, rightSlot }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div
      className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between gap-3">
        {(showBack || onBack) ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} strokeWidth={2.5} className="text-foreground" />
          </button>
        ) : (
          <div className="w-9 shrink-0" />
        )}

        <div className="flex-1 text-center">
          <h1 className="text-[17px] font-semibold tracking-[-0.3px] truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
          )}
        </div>

        <div className="w-9 shrink-0 flex justify-end">
          {rightSlot || null}
        </div>
      </div>
    </div>
  );
}