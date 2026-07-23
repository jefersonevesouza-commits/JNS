import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const PIE_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5AC8FA'];

export const STATUS_COLORS = {
  Pago: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Recebido: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Pendente: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
};

export const CATEGORY_OPTIONS = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros'];
export const PAYMENT_OPTIONS = ['Pix', 'Dinheiro', 'Cartão'];
export const PEOPLE_OPTIONS = ['Jeferson', 'Ana Clara', 'Reserva'];
export const STATUS_OPTIONS = ['Pago', 'Pendente', 'Recebido'];
export const SCOPE_OPTIONS = [
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'empresa', label: 'Empresa' }
];

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const isIframe = typeof window !== 'undefined' && window.self !== window.top;
