import React, { useState, useEffect, useMemo } from 'react';
import { TransactionService } from '@/services/TransactionService';
import { User, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import MonthSelector from '@/components/finance/MonthSelector';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export default function People() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const items = await TransactionService.filter({ month });
      setTransactions(items);
      setLoading(false);
    };

    load();
  }, [month]);

  const people = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (!t.name) return;
      if (!map[t.name]) map[t.name] = { name: t.name, income: 0, expense: 0, pending: 0, transactions: [] };
      const p = map[t.name];
      p.transactions.push(t);
      if (t.type === 'receita') p.income += t.amount || 0;
      else {
        p.expense += t.amount || 0;
        if (t.status === 'Pendente') p.pending += t.amount || 0;
      }
    });
    return Object.values(map).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }, [transactions]);

  const selected = people.find(p => p.name === selectedPerson);

  return (
    <div className="flex-1 min-h-0 bg-background flex flex-col">
      {/* Safe-area-aware sticky header */}
      <div
        className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center gap-3">
          {selectedPerson ? (
            <button
              onClick={() => setSelectedPerson(null)}
              className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} strokeWidth={2.5} className="text-foreground" />
            </button>
          ) : (
            <div className="w-9 shrink-0" />
          )}
          <h1 className="text-[20px] font-bold tracking-[-0.4px] flex-1 text-center">
            {selectedPerson ? selectedPerson : 'Pessoas'}
          </h1>
          <div className="w-9 shrink-0" />
        </div>
      </div>

      <div data-page-scroll="true" className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 pt-4"
        style={{ paddingBottom: 'calc(56px + 12px + env(safe-area-inset-bottom, 0px))' }}>
        {!selectedPerson && (
          <div className="mb-5">
            <MonthSelector value={month} onChange={setMonth} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-7 h-7 border-[3px] border-muted border-t-foreground rounded-full animate-spin" />
          </div>
        ) : people.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <User size={40} strokeWidth={1.5} className="text-muted-foreground/30 mb-3" />
            <p className="text-[14px] text-muted-foreground">Nenhuma pessoa neste mês</p>
          </div>
        ) : !selectedPerson ? (
          <div className="space-y-2">
            {people.map((p, i) => (
              <motion.button
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => setSelectedPerson(p.name)}
                className="w-full bg-card rounded-[20px] border border-border/30 shadow-sm p-4 flex items-center gap-3.5 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[15px] font-bold shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold tracking-[-0.2px]">{p.name}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(p.income)}</span>
                    <span className="text-[12px] text-rose-600 dark:text-rose-400 font-medium">−{formatCurrency(p.expense)}</span>
                  </div>
                </div>
                {p.pending > 0 && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-medium self-start -mt-0.5">
                    {formatCurrency(p.pending)} pendente
                  </Badge>
                )}
                <ChevronRight size={16} strokeWidth={2} className="text-muted-foreground/40 shrink-0" />
              </motion.button>
            ))}
          </div>
        ) : selected ? (
          <div className="mt-2">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[17px] font-bold">
                {selected.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-[20px] font-bold tracking-[-0.3px]">{selected.name}</h2>
                <p className="text-[12px] text-muted-foreground">{selected.transactions.length} transações</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-[16px] p-3 text-center">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold tracking-wider">Receitas</p>
                <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{formatCurrency(selected.income)}</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/50 rounded-[16px] p-3 text-center">
                <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold tracking-wider">Despesas</p>
                <p className="text-[14px] font-bold text-rose-700 dark:text-rose-400 mt-0.5">{formatCurrency(selected.expense)}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/50 rounded-[16px] p-3 text-center">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold tracking-wider">Pendente</p>
                <p className="text-[14px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">{formatCurrency(selected.pending)}</p>
              </div>
            </div>

            <div className="bg-card rounded-[20px] border border-border/30 shadow-sm overflow-hidden">
              {selected.transactions.map((t, i) => (
                <div key={t.id || i} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-[14px] font-medium tracking-[-0.2px]">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{t.due_date || '—'} · {t.payment_method || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[14px] font-semibold tracking-[-0.2px] ${t.type === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {t.type === 'receita' ? '+' : '−'}{formatCurrency(t.amount || 0)}
                    </p>
                    <Badge variant="secondary" className={`text-[10px] font-medium mt-0.5 ${t.status === 'Pendente' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}