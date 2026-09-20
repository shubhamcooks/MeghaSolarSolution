'use client';

import Link from 'next/link';
import { Sun, Wrench, FileText, Lightbulb, TrendingUp, Zap, ArrowRight, Thermometer, BarChart3, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Disclaimer from '@/components/shared/Disclaimer';

const services = [
  {
    icon: Sun,
    title: 'Solar Installation',
    desc: 'Residential and commercial rooftop solar installation services. We handle everything from system design to panel mounting, inverter setup, wiring, and grid connection.',
    points: ['Site assessment & system design', 'Panel & inverter installation', 'Net metering setup assistance', 'Grid connection support'],
    link: '/apply',
  },
  {
    icon: Thermometer,
    title: 'Solar Water Heater Installation & Services',
    desc: 'Consultation, supply coordination, installation, maintenance and repair/service support for solar water heating systems.',
    points: ['Consultation & system sizing', 'Supply coordination', 'Professional installation', 'Maintenance & repair service'],
    link: '/services/solar-water-heater',
    featured: true,
  },
  {
    icon: BarChart3,
    title: 'Electricity Consumption Analysis',
    desc: 'Our R&D team analyzes your electricity bills to help evaluate suitable solar solutions based on your actual usage patterns.',
    points: ['Bill analysis (2-5 years)', 'Consumption trend charts', 'Estimated solar requirement', 'Estimated savings & payback'],
    link: '/energy-analysis',
  },
  {
    icon: Calculator,
    title: 'Solar Savings Calculator',
    desc: 'Estimate your potential solar savings with our interactive calculator. Compare current electricity costs with a solar-assisted scenario.',
    points: ['Compare current vs solar costs', '5-year & 10-year projections', 'Payback period estimate', 'Save calculations'],
    link: '/solar-calculator',
  },
  {
    icon: Wrench,
    title: 'Repairing / Service Work',
    desc: 'Maintenance, repair, and servicing of solar systems and related electrical infrastructure. We keep your solar system running efficiently.',
    points: ['Panel cleaning & maintenance', 'Inverter repair & replacement', 'Wiring inspection & repair', 'System performance check'],
    link: '/apply',
  },
  {
    icon: FileText,
    title: 'Government Tender Work',
    desc: 'We participate in government tender and project work for solar and electrical infrastructure projects across Meghalaya.',
    points: ['Tender participation', 'Project execution', 'Infrastructure development', 'Compliance & documentation'],
    link: '/government-tenders',
  },
  {
    icon: Lightbulb,
    title: 'Solar Street Lamps',
    desc: 'Installation, servicing, and maintenance of solar street-light systems for communities, streets, and public spaces.',
    points: ['Street light installation', 'Battery & panel setup', 'Dusk-to-dawn automation', 'Regular maintenance'],
    link: '/apply',
  },
  {
    icon: Zap,
    title: 'Electrical Services',
    desc: 'Comprehensive electrical service work including wiring, inverter setup, system upgrades, and safety inspections.',
    points: ['Wiring & rewiring', 'Inverter & battery setup', 'Safety inspections', 'System upgrades'],
    link: '/apply',
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Our Services</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive solar and electrical services for homes, businesses, and communities across Meghalaya.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className={`hover:shadow-lg transition-all overflow-hidden ${service.featured ? 'border-amber-300 ring-1 ring-amber-200' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed mb-4">{service.desc}</p>
                    <ul className="space-y-2">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    {service.link && (
                      <Link href={service.link} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need a Service?</h2>
          <p className="text-amber-50 mb-8 max-w-2xl mx-auto">Get in touch with us for any solar or electrical service needs.</p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/apply">
              <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-amber-50">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
