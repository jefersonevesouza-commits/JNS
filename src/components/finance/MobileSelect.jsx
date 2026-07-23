import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * On mobile: renders a bottom-sheet Drawer picker.
 * On desktop: renders the standard shadcn Select.
 */
export default function MobileSelect({ value, onValueChange, options, placeholder, triggerClassName }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const label = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = label ? (typeof label === 'string' ? label : label.label) : placeholder;

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            return <SelectItem key={v} value={v}>{l}</SelectItem>;
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between w-full bg-background border border-input px-3 text-[14px] text-foreground ${triggerClassName || 'rounded-[14px] h-11 mt-1.5'}`}
      >
        <span className={value ? '' : 'text-muted-foreground'}>{displayLabel || placeholder}</span>
        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="pb-safe">
          <DrawerHeader>
            <DrawerTitle className="text-[16px] font-semibold text-center">{placeholder || 'Selecione'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1">
            {options.map(o => {
              const v = typeof o === 'string' ? o : o.value;
              const l = typeof o === 'string' ? o : o.label;
              const selected = v === value;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => { onValueChange(v); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] text-[15px] font-medium transition-colors ${
                    selected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <span>{l}</span>
                  {selected && <Check size={18} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}