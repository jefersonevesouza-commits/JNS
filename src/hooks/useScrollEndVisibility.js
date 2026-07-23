import { useEffect, useState } from 'react';

export function useScrollEndVisibility(enabled) {
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setAtBottom(true);
      return;
    }

    const getScrollElement = () => document.querySelector('[data-page-scroll]');
    const element = getScrollElement();
    const target = element || window;

    const handleScroll = () => {
      if (element) {
        const threshold = 30;
        const isBottom = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
        setAtBottom(isBottom);
      } else {
        const scrollTop = window.scrollY || window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        setAtBottom(docHeight - scrollTop - winHeight <= 30);
      }
    };

    handleScroll();
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  return atBottom;
}
