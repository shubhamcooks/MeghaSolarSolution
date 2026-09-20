'use client';

import Link from 'next/link';
import { Sun, MapPin, Mail, Phone, ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white">Megha Solar Solutions</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{t('footer.about')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">{t('nav.home')}</Link></li>
              <li><Link href="/pm-surya-ghar" className="hover:text-amber-400 transition-colors">{t('nav.pmSuryaGhar')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-amber-400 transition-colors">{t('nav.howItWorks')}</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">{t('nav.services')}</Link></li>
              <li><Link href="/apply" className="hover:text-amber-400 transition-colors">{t('nav.apply')}</Link></li>
              <li><Link href="/track" className="hover:text-amber-400 transition-colors">{t('nav.track')}</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Solar Installation</Link></li>
              <li><Link href="/services/solar-water-heater" className="hover:text-amber-400 transition-colors">Solar Water Heater</Link></li>
              <li><Link href="/energy-analysis" className="hover:text-amber-400 transition-colors">Energy Analysis</Link></li>
              <li><Link href="/solar-calculator" className="hover:text-amber-400 transition-colors">Solar Calculator</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Repair & Service</Link></li>
              <li><Link href="/government-tenders" className="hover:text-amber-400 transition-colors">Government Tenders</Link></li>
              <li><Link href="/future-benefits" className="hover:text-amber-400 transition-colors">Future Benefits of Solar</Link></li>
            </ul>
            <h3 className="font-semibold text-white mb-3 mt-6">{t('footer.serviceAreas')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-amber-400" /> Nongstoin</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-amber-400" /> Myrâng</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-amber-400" /> Dhirang</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-amber-400" /> Chyllang</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-amber-400" /> Lumingshai</li>
            </ul>
          </div>

          {/* Important */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.important')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link href="/pm-surya-ghar" className="hover:text-amber-400 transition-colors">{t('footer.disclaimer')}</Link></li>
            </ul>

            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>03644051727</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>meghasolarsolutions@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer bar */}
        <div className="mt-10 border-t border-slate-700 pt-6">
          <div className="flex items-start gap-3 rounded-lg bg-slate-800 p-4">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">{t('disclaimer.text')}</p>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Megha Solar Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
