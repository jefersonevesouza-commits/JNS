import React, { useState, useEffect } from 'react';
import { Trash2, ChevronRight, Shield, Bell, Moon, Sun, Monitor, Info, Download, CheckCircle } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { TransactionService } from '@/services/TransactionService';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-1 mb-2">{title}</p>
    <div className="bg-card rounded-[20px] border border-border/30 shadow-sm overflow-hidden">
      {children}
    </div>
  </div>
);

const Row = ({ icon: Icon, label, sublabel, onClick, danger, rightSlot, last }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60 ${!last ? 'border-b border-border/20' : ''} ${danger ? 'text-destructive' : 'text-foreground'}`}
  >
    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${danger ? 'bg-destructive/10' : 'bg-muted/60'}`}>
      <Icon size={16} strokeWidth={2} className={danger ? 'text-destructive' : 'text-foreground/70'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[14px] font-medium tracking-[-0.1px] ${danger ? 'text-destructive' : ''}`}>{label}</p>
      {sublabel && <p className="text-[12px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
    {rightSlot || <ChevronRight size={15} strokeWidth={2} className="text-muted-foreground/40 shrink-0" />}
  </button>
);

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Escuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsInstalled(standalone);

    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { deferredPrompt, isInstalled, isIOS };
}

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { hideBottomNavOnScroll, setHideBottomNavOnScroll } = useAppSettings();
  const { deferredPrompt, isInstalled, isIOS } = useInstallPWA();
  const { user, login, logout, authEnabled, authError, isLoadingAuth } = useAuth();

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({ title: 'Instalação indisponível', description: 'O navegador ainda não disponibilizou o prompt de instalação. Tente novamente em breve.', duration: 2500 });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: 'App instalado!', description: 'Acesse pelo ícone na tela inicial.', duration: 1000 });
    } else {
      toast({ title: 'Instalação cancelada', description: 'O app não foi instalado.', duration: 1000 });
    }
  };

  const handleDeleteAllData = () => {
    TransactionService.clearAll();
    toast({ title: 'Dados excluídos', description: 'Todas as suas transações foram removidas.', duration: 1000 });
    setShowDeleteConfirm(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      toast({ title: 'Login realizado', description: 'Sua sessão do Firebase foi iniciada.', duration: 1200 });
    } catch (error) {
      toast({ title: 'Falha ao entrar', description: error.message || 'Não foi possível autenticar.', duration: 2200 });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logout realizado', description: 'Você saiu da sessão do Firebase.', duration: 1000 });
  };

  return (
    <div className="flex-1 min-h-0 bg-background flex flex-col">
      <div
        className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center">
          <h1 className="text-[20px] font-bold tracking-[-0.4px]">Configurações</h1>
        </div>
      </div>

      <div data-page-scroll="true" className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 pt-4"
        style={{ paddingBottom: 'calc(56px + 12px + env(safe-area-inset-bottom, 0px))' }}>
        <Section title="Conta">
          <Row icon={Shield} label="Privacidade" sublabel="Gerencie seus dados" last={false} />
          <Row icon={Bell} label="Notificações" sublabel="Alertas de vencimento" last={false} />
          <Row
            icon={Moon}
            label="Aparência"
            sublabel={THEME_OPTIONS.find(o => o.value === theme)?.label || 'Sistema'}
            onClick={() => setShowThemePicker(p => !p)}
            last
            rightSlot={
              <ChevronRight
                size={15}
                strokeWidth={2}
                className={`text-muted-foreground/40 shrink-0 transition-transform ${showThemePicker ? 'rotate-90' : ''}`}
              />
            }
          />
          {authEnabled && (
            <div className="border-t border-border/20 px-4 py-4 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-[14px] bg-muted/50 px-3 py-2">
                    <p className="text-[12px] text-muted-foreground">Usuário autenticado</p>
                    <p className="text-[14px] font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-[14px] bg-card border border-border px-4 py-3 text-[14px] font-semibold text-foreground"
                  >
                    Sair do Firebase
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="text-[12px] font-medium text-muted-foreground">E-mail</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-muted-foreground">Senha</label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="mt-1" />
                  </div>
                  {authError && (
                    <p className="text-[12px] text-destructive">{authError.message}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoadingAuth}
                    className="w-full rounded-[14px] bg-primary text-primary-foreground px-4 py-3 text-[14px] font-semibold disabled:opacity-60"
                  >
                    {isLoadingAuth ? 'Entrando...' : 'Entrar com Firebase'}
                  </button>
                </form>
              )}
            </div>
          )}
          {showThemePicker && (
            <div className="flex border-t border-border/20">
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setShowThemePicker(false); }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 text-[12px] font-medium transition-colors ${theme === value ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section title="Navegação inferior">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[14px] font-medium tracking-[-0.1px]">Ocultar menu ao rolar</p>
              <p className="text-[12px] text-muted-foreground mt-1">Exibe o menu de navegação somente ao chegar ao final da página.</p>
            </div>
            <Switch
              checked={hideBottomNavOnScroll}
              onCheckedChange={setHideBottomNavOnScroll}
              className={hideBottomNavOnScroll ? 'data-[state=checked]:bg-primary' : ''}
            />
          </div>
        </Section>

        {!isInstalled && (
          <Section title="Instalar App">
            <div className="px-4 py-4">
              <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">
                Instale o app no seu dispositivo para acessar rapidamente sem depender do navegador.
              </p>
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary text-primary-foreground rounded-[14px] text-[15px] font-semibold active:scale-[0.98] transition-transform"
              >
                <Download size={17} strokeWidth={2.5} />
                Instalar App
              </button>
            </div>
          </Section>
        )}

        {isInstalled && (
          <Section title="Instalar App">
            <div className="px-4 py-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <p className="text-[14px] text-muted-foreground">App já está instalado na tela inicial.</p>
            </div>
          </Section>
        )}

        <Section title="Sobre">
          <Row icon={Info} label="Neves Finance" sublabel="Versão 1.0.0" last rightSlot={<span className="text-[12px] text-muted-foreground">v1.0.0</span>} />
        </Section>

        <Section title="Zona de perigo">
          <Row
            icon={Trash2}
            label="Excluir todos os dados"
            sublabel="Remove todas as suas transações permanentemente"
            onClick={() => setShowDeleteConfirm(true)}
            danger
            last
          />
        </Section>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[24px] max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[17px] font-bold tracking-[-0.3px]">Excluir todos os dados?</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-muted-foreground leading-relaxed">
              Esta ação é permanente e não pode ser desfeita. Todas as suas transações serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-[14px] flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              className="rounded-[14px] flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}