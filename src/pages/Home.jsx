import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionService } from '@/services/TransactionService';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import SummaryCard from '@/components/finance/SummaryCard';
import MonthSelector from '@/components/finance/MonthSelector';
import { formatCurrency } from '@/lib/utils';

const PIE_COLORS = [
  '#0A84FF',
  '#30D158',
  '#FF453A',
  '#FF9F0A',
  '#BF5AF2'
];

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

export default function Home(){
  const navigate = useNavigate();
  const [transactions,setTransactions] = useState([]);
  const [month,setMonth] = useState(defaultMonth);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      const items = await TransactionService.filter({ month });
      setTransactions(items);
      setLoading(false);
    };

    load();
  },[month]);

  const stats = useMemo(()=>{
    const income = transactions.filter(t=>t.type==="receita");
    const expense = transactions.filter(t=>t.type==="despesa");
    const totalIncome = income.reduce((s,t)=>s+(t.amount||0),0);
    const totalExpense = expense.reduce((s,t)=>s+(t.amount||0),0);
    const paidExpense = expense.filter(t=>t.status==="Pago").reduce((s,t)=>s+(t.amount||0),0);
    const pendingExpense = expense.filter(t=>t.status==="Pendente").reduce((s,t)=>s+(t.amount||0),0);
    const receivedIncome = income.filter(t=>t.status==="Recebido").reduce((s,t)=>s+(t.amount||0),0);

    const catMap={};
    expense.forEach(t=>{
      const cat=t.category || "Outros";
      catMap[cat] = (catMap[cat] || 0) + t.amount;
    });
    const categories = Object.entries(catMap).map(([name,value])=>({name,value}));

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome-totalExpense,
      paidExpense,
      pendingExpense,
      receivedIncome,
      categories
    };
  },[transactions]);

  return (
    <div className="flex-1 min-h-0 bg-background text-foreground transition-colors duration-300 flex flex-col">
      {/* HEADER */}
      <div
        className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border/40 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}
      >
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Painel</h1>
            <p className="text-xs text-muted-foreground">Controle financeiro</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted/60 active:scale-95 transition-all"
            aria-label="Configurações"
          >
            <Settings size={18} strokeWidth={2} className="text-foreground" />
          </button>
        </div>
      </div>

      <div data-page-scroll="true" className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-5 pt-5"
        style={{ paddingBottom: 'calc(56px + 12px + env(safe-area-inset-bottom, 0px))' }}>
        <MonthSelector value={month} onChange={setMonth} />

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-muted border-t-foreground animate-spin" />
          </div>
        ) : (
          <>
            {/* SALDO */}
            <motion.div
              initial={{ opacity:0, scale:.97 }}
              animate={{ opacity:1, scale:1 }}
              className="mt-5 rounded-[30px] p-6 relative overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
              <p className="text-xs uppercase tracking-[.18em] text-muted-foreground">Saldo do Mês</p>
              <h2 className="text-[38px] font-bold tracking-tight mt-2">{formatCurrency(stats.balance)}</h2>
              <div className="flex gap-5 mt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-muted-foreground">{formatCurrency(stats.totalIncome)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-sm text-muted-foreground">{formatCurrency(stats.totalExpense)}</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <SummaryCard label="A Receber" value={stats.totalIncome - stats.receivedIncome} icon={TrendingUp} color="blue" index={0} />
              <SummaryCard label="Despesas" value={stats.totalExpense} icon={TrendingDown} color="red" index={1} />
              <SummaryCard label="Já Pago" value={stats.paidExpense} icon={CheckCircle} color="green" index={2} />
              <SummaryCard label="Falta Pagar" value={stats.pendingExpense} icon={AlertCircle} color="amber" index={3} />
            </div>

            {stats.categories.length > 0 && (
              <motion.div
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0 }}
                className="mt-5 rounded-[28px] p-5 bg-card border border-border/40 shadow-sm"
              >
                <h3 className="font-semibold text-sm mb-4">Despesas por Categoria</h3>
                <div className="flex items-center gap-5">
                  <div className="w-[110px] h-[110px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.categories} dataKey="value" innerRadius={30} outerRadius={50} paddingAngle={5}>
                          {stats.categories.map((_,i)=>(
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {stats.categories.map((cat,i)=>(
                      <div key={cat.name} className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <strong>{formatCurrency(cat.value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
