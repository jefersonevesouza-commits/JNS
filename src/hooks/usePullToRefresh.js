import { useState, useRef, useEffect, useCallback } from 'react';

const THRESHOLD = 72;
const MAX_PULL = 120;

export function usePullToRefresh(onRefresh, containerRef) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const pullingRef = useRef(false);
  const triggeredRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef?.current;
    if (!el || el.scrollTop > 0 || refreshing) return;
    startYRef.current = e.touches[0].clientY;
    pullingRef.current = true;
    triggeredRef.current = false;
  }, [containerRef, refreshing]);

  const handleTouchMove = useCallback((e) => {
    const el = containerRef?.current;
    if (!el || !pullingRef.current || startYRef.current === null) return;
    if (el.scrollTop > 0) {
      pullingRef.current = false;
      startYRef.current = null;
      setPullDistance(0);
      return;
    }

    const dy = e.touches[0].clientY - startYRef.current;
    if (dy <= 0) {
      setPullDistance(0);
      return;
    }

    const clamped = Math.min(dy * 0.45, MAX_PULL);
    setPullDistance(clamped);

    if (clamped > 0) {
      e.preventDefault();
    }
  }, [containerRef]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= THRESHOLD && !triggeredRef.current) {
      triggeredRef.current = true;
      setRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, containerRef]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  return { pullDistance, refreshing, progress };
}