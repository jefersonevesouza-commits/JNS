import React from 'react';
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, STATUS_COLORS } from '@/lib/utils';

export default function TransactionItem({ transaction, onEdit, onDelete, onToggleStatus }) {
  const isIncome = transaction.type === 'receita';
  const formatted = formatCurrency(transaction.amount);

  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-border/40 last:border-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-rose-50 dark:bg-rose-950/50'}`}>
        {isIncome
          ? <ArrowDownLeft size={18} strokeWidth={2} className="text-emerald-600 dark:text-emerald-400" />
          : <ArrowUpRight size={18} strokeWidth={2} className="text-rose-600 dark:text-rose-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold truncate tracking-[-0.2px]">{transaction.description}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">{transaction.name} · {transaction.payment_method || '—'}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="text-right">
          <p className={`text-[15px] font-semibold tracking-[-0.2px] ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isIncome ? '+' : '−'}{formatted}
          </p>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${STATUS_COLORS[transaction.status] || ''}`}>
            {transaction.status}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
              <MoreHorizontal size={15} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onToggleStatus(transaction)}>
              {transaction.status === 'Pendente' ? 'Marcar como Pago' : 'Marcar como Pendente'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(transaction)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(transaction)}>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}