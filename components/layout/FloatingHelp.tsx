'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Headset, Phone, MessageCircle, UserPlus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';

export default function FloatingHelp() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popover Card Menu */}
      {open && (
        <div className="flex flex-col gap-2.5 min-w-[240px] p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header Badge */}
          <div className="px-3 py-1.5 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Support
            </span>
          </div>

          {/* Call Option */}
          <a
            href="tel:03644051727"
            className="group flex items-center gap-3.5 rounded-xl p-2.5 hover:bg-slate-800 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                {t('help.call')}
              </span>
              <span className="text-sm font-semibold text-white group-hover:text-emerald-300">
                03644051727
              </span>
            </div>
          </a>

          {/* WhatsApp Option */}
          <a
            href="https://wa.me/[WHATSAPP_PLACEHOLDER]"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 rounded-xl p-2.5 hover:bg-slate-800 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors duration-200">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                {t('help.whatsapp')}
              </span>
              <span className="text-sm font-semibold text-white group-hover:text-green-300">
                Chat with us
              </span>
            </div>
          </a>

          {/* Callback Option */}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3.5 rounded-xl p-2.5 hover:bg-slate-800 transition-colors duration-200"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                {t('help.callback')}
              </span>
              <span className="text-sm font-semibold text-white group-hover:text-amber-300">
                We will call you
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Trigger Button without Glow */}
      <Button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle Support Menu"
        className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg active:scale-95 transition-all duration-200"
        size="icon"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <Headset className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}