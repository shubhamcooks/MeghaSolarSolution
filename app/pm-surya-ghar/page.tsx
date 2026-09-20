'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, CheckCircle2, AlertCircle, ArrowRight, FileText, Lightbulb, Home, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Disclaimer from '@/components/shared/Disclaimer';
import { supabase, type GovInfo } from '@/lib/supabase/client';

const solarImage = 'https://images.pexels.com/photos/38171120/pexels-photo-38171120.jpeg?auto=compress&cs=tinysrgb&w=1920';

const topics = [
  { icon: Sun, title: 'What is the scheme?', desc: 'PM Surya Ghar: Muft Bijli Yojana is a Government of India scheme that encourages rooftop solar installation for households. Eligible households may receive financial assistance from the government.' },
  { icon: Zap, title: 'Why rooftop solar?', desc: 'Rooftop solar panels generate electricity from sunlight, reducing your electricity bills and providing clean energy. Extra electricity can be sent to the grid for credits.' },
  { icon: Home, title: 'Who may be eligible?', desc: 'Eligibility is determined by the government and your DISCOM. Generally, residential households with a valid electricity connection may apply. Specific criteria may apply.' },
  { icon: Lightbulb, title: 'How rooftop solar works', desc: 'Solar panels on your roof capture sunlight and convert it to electricity. This powers your home during the day. Grid-connected systems can export excess power.' },
  { icon: ShieldCheck, title: 'What subsidy means', desc: 'A subsidy is financial help from the government that reduces installation cost. The amount depends on government rules and system size. It is disbursed directly by the government.' },
  { icon: FileText, title: 'What to prepare', desc: 'You may need: identity proof, electricity bill, property proof, and bank details. Exact requirements depend on government and DISCOM rules.' },
];

export default function PMSuryaGharPage() {
  const [govInfo, setGovInfo] = useState<Record<string, GovInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('government_information').select('*');
      if (data) {
        const map: Record<string, GovInfo> = {};
        (data as GovInfo[]).forEach((item) => { map[item.key] = item; });
        setGovInfo(map);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
              <Sun className="h-4 w-4" />
              Government of India Scheme
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              PM Surya Ghar: Muft Bijli Yojana — Explained Simply
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Everything you need to know about the government rooftop solar scheme, explained in simple language.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Government Info */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {govInfo.pm_surya_ghar_overview && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-amber-500" />{govInfo.pm_surya_ghar_overview.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{govInfo.pm_surya_ghar_overview.content}</p></CardContent>
                </Card>
              )}
              {govInfo.pm_surya_ghar_eligibility && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />{govInfo.pm_surya_ghar_eligibility.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{govInfo.pm_surya_ghar_eligibility.content}</p></CardContent>
                </Card>
              )}
              {govInfo.pm_surya_ghar_subsidy && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-500" />{govInfo.pm_surya_ghar_subsidy.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{govInfo.pm_surya_ghar_subsidy.content}</p></CardContent>
                </Card>
              )}
              {govInfo.pm_surya_ghar_process && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-sky-500" />{govInfo.pm_surya_ghar_process.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{govInfo.pm_surya_ghar_process.content}</p></CardContent>
                </Card>
              )}
              {govInfo.mepdcl_info && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" />{govInfo.mepdcl_info.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{govInfo.mepdcl_info.content}</p></CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Understanding the Scheme</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card key={topic.title} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 mb-4">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{topic.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{topic.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important Limitations */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Important Limitations & Eligibility Conditions</p>
              <p className="text-sm text-red-800 leading-relaxed">
                Government scheme rules, eligibility, subsidy amounts and approval procedures may change. Please verify the latest information through the official government portal (pmsuryaghar.gov.in) and your relevant DISCOM. Megha Solar Solutions does not determine eligibility or approve applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Want help with the installation process?</h2>
          <p className="text-amber-50 mb-8 max-w-2xl mx-auto">Start your solar installation request and our team will guide you through every step.</p>
          <Link href="/apply">
            <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-amber-50">
              Start Your Solar Installation Request <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
