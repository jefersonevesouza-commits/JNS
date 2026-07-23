import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TransactionService } from '@/services/TransactionService';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MonthSelector from '@/components/finance/MonthSelector';
import TransactionItem from '@/components/finance/TransactionItem';
import TransactionForm from '@/components/finance/TransactionForm';
import PullRefreshIndicator from '@/components/finance/PullRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useToast } from '@/components/ui/use-toast';

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'receita', label: 'Receitas' },
  { key: 'despesa', label: 'Despesas' },
  { key: 'pendente', label: 'Pendentes' },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const { toast } = useToast();
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const items = await TransactionService.filter({ month }, '-created_date');
    setTransactions(items);
    setLoading(false);
  }, [month]);

  useEffect(() => { void load(); }, [load]);

  const { pullDistance, refreshing, progress } = usePullToRefresh(load, scrollRef);

  const filtered = transactions.filter(t => {
    if (filter === 'receita' && t.type !== 'receita') return false;
    if (filter === 'despesa' && t.type !== 'despesa') return false;
    if (filter === 'pendente' && t.status !== 'Pendente') return false;
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase()) && !t.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = async (data) => {
    if (editData) {
      await TransactionService.update(editData.id, data);
      setTransactions(prev => prev.map(t => t.id === editData.id ? { ...t, ...data } : t));
      toast({ title: 'Transação atualizada', duration: 1000 });
    } else {
      const newItem = await TransactionService.create(data);
      setTransactions(prev => [newItem, ...prev]);
      toast({ title: 'Transação adicionada', duration: 1000 });
    }
    setEditData(null);
    await load();
  };

  const handleDelete = async (t) => {
    await TransactionService.delete(t.id);
    setTransactions(prev => prev.filter(x => x.id !== t.id));
    toast({ title: 'Transação excluída', duration: 1000 });
    await load();
  };

  const handleToggleStatus = async (t) => {
    const newStatus = t.status === 'Pendente' ? (t.type === 'receita' ? 'Recebido' : 'Pago') : 'Pendente';
    await TransactionService.update(t.id, { status: newStatus });
    setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    await load();
  };

  const handleEdit = (t) => {
    setEditData(t);
    setFormOpen(true);
  };

  return (
    <div className="flex-1 min-h-0 bg-background flex flex-col">
      {/* Safe-area-aware sticky header */}
      <div
        className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-[20px] font-bold tracking-[-0.4px]">Transações</h1>
          <Button
            size="sm"
            className="rounded-full h-9 px-4 text-[13px] font-semibold gap-1.5 shadow-sm"
            onClick={() => { setEditData(null); setFormOpen(true); }}
          >
            <Plus size={16} strokeWidth={2.5} /> Nova
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div data-page-scroll="true" ref={scrollRef} className="flex-1 overflow-y-auto relative overflow-x-hidden"
        style={{
          paddingBottom: 'calc(56px + 12px + env(safe-area-inset-bottom, 0px))',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom',
          overflowX: 'hidden',
        }}>
        <PullRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} progress={progress} />

        <div
          className="max-w-lg mx-auto px-5"
          style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none', transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none' }}
        >
          <div className="pt-4">
            <MonthSelector value={month} onChange={setMonth} />
          </div>

          <div className="relative mt-4">
            <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transação..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-[16px] h-11 bg-card border-border/30 text-[14px]"
            />
          </div>

          <div className="flex gap-1.5 mt-4 p-1 bg-muted/60 rounded-[16px]">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-[12px] transition-all ${
                  filter === f.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-7 h-7 border-[3px] border-muted border-t-foreground rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-[14px] text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="mt-4 bg-card rounded-[22px] border border-border/30 shadow-sm px-4">
              {filtered.map(t => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} editData={editData} currentMonth={month} />
    </div>
  );
}