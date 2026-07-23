import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullRefreshIndicator({ pullDistance, refreshing, progress }) {
  if (pullDistance <= 0 && !refreshing) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-20"
      style={{ height: refreshing ? 52 : pullDistance, overflow: 'hidden', transition: refreshing ? 'height 0.2s ease' : 'none' }}
    >
      <div
        className={`w-9 h-9 rounded-full bg-card border border-border/40 shadow-md flex items-center justify-center transition-all ${refreshing ? 'opacity-100' : ''}`}
        style={{ opacity: progress, transform: `scale(${0.6 + progress * 0.4}) rotate(${progress * 180}deg)` }}
      >
        <RefreshCw
          size={16}
          className={`text-primary ${refreshing ? 'animate-spin' : ''}`}
        />
      </div>
    </div>
  );
}