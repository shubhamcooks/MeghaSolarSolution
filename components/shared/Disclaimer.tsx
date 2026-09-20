'use client';

import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

interface DisclaimerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function Disclaimer({ className, variant = 'default' }: DisclaimerProps) {
  const { t } = useI18n();

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2', className)}>
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">{t('disclaimer.text')}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4', className)}>
      <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-900 mb-1">Important Disclaimer</p>
        <p className="text-sm text-amber-800 leading-relaxed">{t('disclaimer.text')}</p>
      </div>
    </div>
  );
}
