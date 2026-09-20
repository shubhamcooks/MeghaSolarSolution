'use client';

import Link from 'next/link';
import {
  Sun, Zap, MapPin, ArrowRight, CheckCircle2, Wrench,
  Lightbulb, FileText, ShieldCheck, Users, TrendingUp, Phone,
  Calculator, BarChart3, Thermometer, TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Disclaimer from '@/components/shared/Disclaimer';
import { useI18n } from '@/lib/i18n/context';

const HERO_IMAGE = 'https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=1920';
const MEGHALAYA_IMAGE = 'https://images.pexels.com/photos/10101268/pexels-photo-10101268.jpeg?auto=compress&cs=tinysrgb&w=1920';

const serviceAreas = ['Nongstoin', 'Myrâng', 'Dhirang', 'Chyllang', 'Lumingshai'];

const services = [
  { icon: Sun, title: 'Solar Installation', desc: 'Residential and commercial rooftop solar panel installation with quality equipment and professional workmanship.' },
  { icon: Thermometer, title: 'Solar Water Heater', desc: 'Consultation, supply coordination, installation, maintenance and repair/service for solar water heating systems.' },
  { icon: BarChart3, title: 'Energy Analysis', desc: 'Our R&D team analyzes your electricity bills to help evaluate suitable solar solutions based on actual usage.' },
  { icon: Calculator, title: 'Solar Calculator', desc: 'Estimate your potential solar savings with our interactive calculator. Compare current vs solar-assisted costs.' },
  { icon: Wrench, title: 'Repair & Service Work', desc: 'Maintenance, repair, and servicing of solar systems and related electrical infrastructure.' },
  { icon: FileText, title: 'Government Tender Work', desc: 'Government tender and project work for solar and electrical infrastructure projects.' },
  { icon: Lightbulb, title: 'Solar Street Lamps', desc: 'Installation, servicing, and maintenance of solar street-light systems for communities.' },
  { icon: Zap, title: 'Electrical Services', desc: 'Comprehensive electrical service work including wiring, inverter setup, and system upgrades.' },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Solar panel installation on rooftop"
            className="h-full w-full object-cover opacity-15"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
        </div>
        <div className="container relative mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
              <Sun className="h-4 w-4" />
              PM Surya Ghar: Muft Bijli Yojana Assistance
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg lg:text-xl leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">
                  {t('hero.applyCta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pm-surya-ghar">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 text-slate-700">
                  {t('hero.learnCta')}
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="font-medium">PM SURYA GHAR / MUFT BIJLI YOJANA</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="font-medium">MEPDCL Ecosystem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Presence Bar */}
      <section className="bg-slate-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-sm sm:text-base">PRESENT IN</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {serviceAreas.map((area) => (
                <span key={area} className="text-sm text-slate-300 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Key Highlights</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              We work in the ecosystem surrounding electricity distribution and customer solar installation, clearly distinguishing our services from official DISCOM responsibilities.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* MEPDCL */}
            <Card className="border-2 hover:border-amber-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 mb-2">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-lg">MEPDCL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We work in the ecosystem surrounding electricity distribution and customer solar installation processes. Megha Solar Solutions is a private company and is not part of MEPDCL or any government body. For official DISCOM matters, please contact MEPDCL directly.
                </p>
              </CardContent>
            </Card>

            {/* PM Surya Ghar */}
            <Card className="border-2 hover:border-green-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-2">
                  <Sun className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">PM Surya Ghar / Muft Bijli Yojana</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A Government of India scheme encouraging rooftop solar installation. We help you understand the scheme and guide you toward the official government process for eligibility, application, and approval.
                </p>
                <Link href="/pm-surya-ghar" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Service Presence */}
            <Card className="border-2 hover:border-sky-300 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 mb-2">
                  <MapPin className="h-6 w-6 text-sky-600" />
                </div>
                <CardTitle className="text-lg">Our Service Presence</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {serviceAreas.map((area) => (
                    <li key={area} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {area}
                    </li>
                  ))}
                </ul>
                <Link href="/service-areas" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700">
                  View service areas <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Services</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Comprehensive solar and electrical services for homes, businesses, and communities across Meghalaya.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 mb-4">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services">
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-700">
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works CTA */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl mb-4">How It Works</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                From your first enquiry to a completed solar installation, we guide you through every step of the process. Our 6-step approach makes solar simple and understandable, even for first-time users.
              </p>
              <ol className="space-y-3 mb-8">
                {['Customer Enquiry', 'Eligibility & Requirement Review', 'Site Assessment', 'Documentation & Application Assistance', 'Solar Installation', 'Inspection / Commissioning / Follow-up'].map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 font-medium">{step}</span>
                  </li>
                ))}
              </ol>
              <Link href="/how-it-works">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  See Full Process <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={MEGHALAYA_IMAGE}
                alt="Meghalaya green hills landscape"
                className="w-full h-[400px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-semibold text-lg">Serving Communities Across Meghalaya</p>
                <p className="text-slate-200 text-sm mt-1">Clean energy for a greener future</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Benefits of Solar */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
              <Sun className="h-4 w-4" />
              Solar Education
            </div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Future Benefits of Going Solar</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Understanding the potential long-term advantages of adopting solar energy for your home or business.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {[
              { icon: TrendingDown, title: 'Potential Bill Reduction', desc: 'Solar may reduce the amount of grid electricity you need to purchase.' },
              { icon: Sun, title: 'Renewable Energy', desc: 'Solar is a renewable resource that is naturally replenished.' },
              { icon: ShieldCheck, title: 'Long-Term Planning', desc: 'A solar system can provide electricity for 25+ years.' },
              { icon: Users, title: 'Community Benefits', desc: 'Solar adoption can contribute to energy awareness and local employment.' },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <Card key={b.title} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 max-w-3xl mx-auto">
            <p className="text-sm text-amber-800 text-center">
              Benefits are potential advantages, not guaranteed outcomes. They depend on system size, usage, sunlight, tariffs, maintenance, and applicable regulations.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link href="/future-benefits">
              <Button variant="outline" size="lg" className="border-green-300 text-green-700 hover:bg-green-50">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl mb-4">
            Ready to Switch to Solar?
          </h2>
          <p className="text-amber-50 max-w-2xl mx-auto mb-8">
            Start your solar installation request today. Our team will guide you through every step of the process.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/apply">
              <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-amber-50 w-full sm:w-auto">
                {t('common.applyNow')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                {t('common.trackApplication')}
              </Button>
            </Link>
          </div>
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
