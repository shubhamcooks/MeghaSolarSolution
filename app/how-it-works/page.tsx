'use client';

import Link from 'next/link';
import { UserSearch, ClipboardCheck, Home, FileText, Sun, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Disclaimer from '@/components/shared/Disclaimer';

const steps = [
  { icon: UserSearch, num: 1, title: 'Customer Enquiry', desc: 'You submit basic information through our application form or contact us. We receive your details and get in touch.', detail: 'Simply fill out the application form on our website or call us. No technical knowledge needed.' },
  { icon: ClipboardCheck, num: 2, title: 'Eligibility & Requirement Review', desc: 'We review your submitted information and identify the likely requirements for your solar installation.', detail: 'Final government/DISCOM eligibility and approval are determined by the appropriate authorities, not by us.' },
  { icon: Home, num: 3, title: 'Site Assessment', desc: 'Our staff visits your location to evaluate roof condition, available area, solar potential, and electrical requirements.', detail: 'We check: roof condition, available rooftop area, approximate solar potential, electrical requirements, and installation feasibility.' },
  { icon: FileText, num: 4, title: 'Documentation & Application Assistance', desc: 'You provide required documents. We assist with the relevant process where applicable.', detail: 'Documents may include identity proof, electricity bill, and property proof. We guide you on what is needed.' },
  { icon: Sun, num: 5, title: 'Solar Installation', desc: 'Our installer team schedules and completes the installation at your location.', detail: 'Physical installation typically takes 1-3 days depending on system size and roof complexity.' },
  { icon: CheckCircle2, num: 6, title: 'Inspection / Commissioning / Follow-up', desc: 'Applicable inspection, metering, commissioning and subsidy processes may involve the relevant authorities/DISCOM.', detail: 'After installation, the system needs inspection and commissioning by relevant authorities. We provide ongoing maintenance support.' },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">How It Works</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From your first enquiry to a completed solar installation — we guide you through every step.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-200 hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="relative flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Number circle */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-lg shadow-md">
                      {step.num}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                          <Icon className="h-5 w-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Step {step.num} — {step.title}</h2>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-2">{step.desc}</p>
                      <p className="text-sm text-slate-500 italic">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-amber-50 mb-8 max-w-2xl mx-auto">Begin your solar journey today. Our team is here to help at every step.</p>
          <Link href="/apply">
            <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-amber-50">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
