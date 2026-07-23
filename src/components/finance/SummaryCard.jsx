import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  neutral: {
    text: 'text-foreground',
    iconBg: 'bg-primary/10',
    icon: 'text-primary'
  },
  green: {
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  blue: {
    text: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/50',
    icon: 'text-sky-600 dark:text-sky-400'
  },
  red: {
    text: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    icon: 'text-rose-600 dark:text-rose-400'
  },
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    icon: 'text-amber-600 dark:text-amber-400'
  },
  purple: {
    text: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    icon: 'text-violet-600 dark:text-violet-400'
  }
};

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
  index = 0
}) {
  const c = colorMap[color] || colorMap.blue;

  const formatted =
    typeof value === 'number'
      ? value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={`
        bg-card
        rounded-[22px]
        p-4
        flex
        flex-col
        gap-2.5
        border
        border-border/40
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
      `}
    >
      <div
        className={`
          w-8
          h-8
          rounded-full
          ${c.iconBg}
          flex
          items-center
          justify-center
        `}
      >
        {Icon && <Icon size={16} className={c.icon} />}
      </div>

      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">
          {label}
        </p>

        <p
          className={`
            text-[17px]
            font-bold
            ${c.text}
            tracking-[-0.3px]
            mt-0.5
          `}
        >
          {formatted}
        </p>
      </div>
    </motion.div>
  );
}