'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sun, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/lib/i18n/context';
import { locales, localeNames, type Locale } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Admins use the full admin panel at /admin rather than /dashboard/admin.
  const dashboardHref = profile?.role === 'admin' ? '/admin' : `/dashboard/${profile?.role}`;

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/pm-surya-ghar', label: t('nav.pmSuryaGhar') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
    { href: '/services', label: t('nav.services') },
    { href: '/service-areas', label: t('nav.serviceAreas') },
    { href: '/solar-calculator', label: 'Calculator' },
    { href: '/energy-analysis', label: 'Energy Analysis' },
    { href: '/about', label: t('nav.about') },
    { href: '/government-tenders', label: 'Tenders' },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-slate-800 leading-tight block">Megha Solar</span>
            <span className="text-xs text-slate-500 leading-tight block">Solutions</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-slate-700 hover:text-amber-600 rounded-md transition-colors"
            >
              <span className="hidden sm:inline">{localeNames[locale]}</span>
              <span className="sm:hidden uppercase text-xs font-bold">{locale}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-50 py-1">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-amber-50 transition-colors',
                        l === locale && 'text-amber-600 font-semibold'
                      )}
                    >
                      {localeNames[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Auth */}
          {profile ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="text-slate-700">{t('nav.dashboard')}</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut} className="text-slate-700">
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="text-slate-700">{t('nav.login')}</Button>
            </Link>
          )}

          {/* Apply button */}
          <Link href="/apply" className="hidden md:block">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              {t('common.applyNow')}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center gap-2 mt-6 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                  <Sun className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-800">Megha Solar Solutions</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/apply"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors mt-2 text-center"
                >
                  {t('common.applyNow')}
                </Link>
                <Link
                  href="/track"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-semibold text-amber-600 border border-amber-300 hover:bg-amber-50 rounded-md transition-colors text-center"
                >
                  {t('common.trackApplication')}
                </Link>
                {profile ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md text-left"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
