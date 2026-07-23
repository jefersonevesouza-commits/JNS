import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeftRight, User } from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { useScrollEndVisibility } from '@/hooks/useScrollEndVisibility';

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { path: '/people', icon: User, label: 'Pessoas' },
];

// Per-tab history stack — persists across renders (module-level)
const tabStacks = {};
tabs.forEach(t => { tabStacks[t.path] = [t.path]; });

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { hideBottomNavOnScroll } = useAppSettings();
  const atBottom = useScrollEndVisibility(hideBottomNavOnScroll);

  // Determine active root tab
  const activeTab = tabs.find(t => t.path !== '/' ? pathname.startsWith(t.path) : pathname === '/')?.path ?? '/';

  const handleTabPress = useCallback((tab) => {
    if (pathname === tab.path) return; // already on root of this tab — no-op

    const isAlreadyActive = activeTab === tab.path;
    if (isAlreadyActive) {
      // Tap again on active tab → pop back to root
      tabStacks[tab.path] = [tab.path];
      navigate(tab.path, { replace: true });
    } else {
      // Switch to tab — restore last position in that tab's stack
      const stack = tabStacks[tab.path];
      const dest = stack[stack.length - 1] || tab.path;
      navigate(dest);
    }

    // Save current path in the current tab's stack before leaving
    if (activeTab !== tab.path) {
      tabStacks[activeTab] = [...(tabStacks[activeTab] || [activeTab]), pathname].slice(-10);
    }
  }, [pathname, activeTab, navigate]);

  useEffect(() => {
    // ensure document is available before creating portal
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const nav = (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-4"
      style={{
        bottom: 0,
        pointerEvents: atBottom || !hideBottomNavOnScroll ? 'auto' : 'none',
      }}
    >
      <div className={`max-w-lg mx-auto bg-card/90 backdrop-blur-2xl rounded-[26px] border border-border/40 shadow-lg shadow-black/5 flex justify-around items-center h-[56px] min-h-[56px] max-h-[56px] overflow-hidden px-2 transition-opacity duration-300 ${atBottom || !hideBottomNavOnScroll ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {tabs.map((tab) => {
          const active = activeTab === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => handleTabPress(tab)}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-all duration-200 ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={active ? 22 : 20} strokeWidth={active ? 2.5 : 2} className="transition-all" />
              <span className={`text-[10px] font-semibold tracking-tight ${active ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (!mounted) return null;
  return createPortal(nav, document.body);
}