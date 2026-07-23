import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MobileSelect from '@/components/finance/MobileSelect';
import { CATEGORY_OPTIONS, PAYMENT_OPTIONS, PEOPLE_OPTIONS, STATUS_OPTIONS, SCOPE_OPTIONS } from '@/lib/utils';

export default function TransactionForm({ open, onOpenChange, onSave, editData, currentMonth }) {
  const [form, setForm] = useState({
    name: '', type: 'receita', payment_method: 'Pix', status: 'Pendente',
    amount: '', description: '', category: 'Outros', due_date: '', month: currentMonth, scope: 'pessoal'
  });

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, amount: String(editData.amount || '') });
    } else {
      setForm({
        name: '', type: 'receita', payment_method: 'Pix', status: 'Pendente',
        amount: '', description: '', category: 'Outros', due_date: '', month: currentMonth, scope: 'pessoal'
      });
    }
  }, [editData, open, currentMonth]);

  const handleSave = () => {
    if (!form.name || !form.amount || !form.description) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
    onOpenChange(false);
  };

  const f = (field) => ({ value: form[field], onValueChange: (v) => setForm(p => ({ ...p, [field]: v })) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[88vh] overflow-y-auto rounded-[24px] border-0 shadow-2xl gap-0 px-0 py-0">
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold tracking-[-0.3px] text-center">
              {editData ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <div className="flex rounded-full bg-muted/80 p-0.5">
              {['receita', 'despesa'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={`px-5 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
                    form.type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {t === 'despesa' ? 'Despesa' : 'Receita'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3.5 px-6 pb-6">
          <div>
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Pessoa</Label>
            <MobileSelect {...f('name')} options={PEOPLE_OPTIONS} placeholder="Selecione..." triggerClassName="rounded-[14px] h-11 mt-1.5" />
          </div>
          <div>
            <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Descrição</Label>
            <Input
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Ex: Salário, Aluguel..."
              className="rounded-[14px] h-11 mt-1.5 text-[14px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Valor</Label>
              <Input
                type="number" step="0.01"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="R$ 0,00"
                className="rounded-[14px] h-11 mt-1.5 text-[14px]"
              />
            </div>
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Pagamento</Label>
              <MobileSelect {...f('payment_method')} options={PAYMENT_OPTIONS} placeholder="Pagamento" triggerClassName="rounded-[14px] h-11 mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Status</Label>
              <MobileSelect {...f('status')} options={STATUS_OPTIONS} placeholder="Status" triggerClassName="rounded-[14px] h-11 mt-1.5" />
            </div>
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Categoria</Label>
              <MobileSelect {...f('category')} options={CATEGORY_OPTIONS} placeholder="Categoria" triggerClassName="rounded-[14px] h-11 mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Escopo</Label>
              <MobileSelect {...f('scope')} options={SCOPE_OPTIONS} placeholder="Escopo" triggerClassName="rounded-[14px] h-11 mt-1.5" />
            </div>
            <div>
              <Label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Data</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                className="rounded-[14px] h-11 mt-1.5 text-[14px] appearance-none leading-none"
              />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full mt-3 h-12 rounded-[16px] text-[15px] font-semibold shadow-sm">
            {editData ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}