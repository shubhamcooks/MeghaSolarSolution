'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sun, Users, MapPin, Award, Target, ArrowRight, Wrench, Lightbulb, Zap, BarChart3, TrendingUp, FileText, Thermometer, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Project } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';

const capabilities = [
  { icon: Sun, title: 'Solar Installation Assistance', desc: 'Professional rooftop solar panel installation for homes and businesses.' },
  { icon: Thermometer, title: 'Solar Water Heater Installation', desc: 'Consultation, supply coordination, installation and maintenance of solar water heating systems.' },
  { icon: BarChart3, title: 'Electricity-Consumption Analysis', desc: 'Detailed analysis of your electricity bills to evaluate suitable solar solutions.' },
  { icon: Target, title: 'Solar System Planning', desc: 'Customized solar system design based on your energy needs and site conditions.' },
  { icon: Wrench, title: 'Installation Coordination', desc: 'End-to-end coordination from site assessment to commissioning.' },
  { icon: Settings, title: 'Maintenance and Repair/Service', desc: 'Ongoing maintenance, repair, and servicing of solar systems.' },
  { icon: Lightbulb, title: 'Solar Street-Light Projects', desc: 'Installation and maintenance of solar street-light systems for communities.' },
  { icon: FileText, title: 'Government-Related Project/Tender Work', desc: 'Participation in government tender and project work for solar infrastructure.' },
];

const rdAnalysisItems = [
  'Historical electricity bills',
  'Monthly electricity consumption',
  'Electricity expenditure',
  'Seasonal usage patterns',
  'Household energy requirements',
  'Existing appliances',
  'Estimated future energy needs',
  'Potential solar system size',
  'Estimated generation and savings',
];

const rdChartTypes = [
  { label: 'Consumption charts', desc: 'Monthly and yearly consumption patterns' },
  { label: 'Expenditure charts', desc: 'Electricity spending over time' },
  { label: 'Yearly comparisons', desc: 'Compare consumption across years' },
  { label: 'Line charts', desc: 'Trend visualization over time' },
  { label: 'Bar charts', desc: 'Monthly comparison visualization' },
  { label: 'Pie/doughnut charts', desc: 'Usage breakdown by category' },
  { label: 'Before-and-after comparisons', desc: 'Current vs estimated solar scenario' },
  { label: 'Estimated solar generation', desc: 'Projected system output' },
  { label: 'Estimated grid offset', desc: 'Portion of consumption offset by solar' },
  { label: 'Estimated savings', desc: 'Projected cost savings' },
  { label: 'Estimated payback period', desc: 'Time to recover system investment' },
];

export default function AboutPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects((data || []) as Project[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">About Megha Solar Solutions</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            We are a local solar company helping communities across Meghalaya adopt clean energy through rooftop solar installation, solar water heater services, electricity-consumption analysis, and PM Surya Ghar scheme assistance.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100"><Sun className="h-6 w-6 text-amber-600" /></div>
                <p className="text-2xl font-bold text-slate-900">Solar</p>
                <p className="text-sm text-slate-500">Installation Experts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100"><MapPin className="h-6 w-6 text-green-600" /></div>
                <p className="text-2xl font-bold text-slate-900">12 Districts</p>
                <p className="text-sm text-slate-500">Across Meghalaya</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100"><Users className="h-6 w-6 text-sky-600" /></div>
                <p className="text-2xl font-bold text-slate-900">Local</p>
                <p className="text-sm text-slate-500">Community Focused</p>
              </CardContent>
            </Card>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Megha Solar Solutions helps customers understand, apply for, coordinate, and complete the solar installation process under the PM Surya Ghar: Muft Bijli Yojana. We also provide solar water heater installation, electricity-consumption analysis, solar system planning, installation coordination, maintenance and repair/service, solar street-light projects, and government-related project/tender work.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              We believe in making solar energy accessible to everyone — from urban customers to rural households, from first-time solar users to elderly customers who may be unfamiliar with technology. Our approach is simple: clear communication, honest guidance, and quality workmanship.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 mb-4">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{cap.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* R&D / Energy Analysis Team */}
      <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700 mb-4">
              <BarChart3 className="h-4 w-4" />
              Personalized R&D / Energy Analysis Team
            </div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl mb-4">Data-Driven Solar Evaluation</h2>
            <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our company has a personalized R&D team that studies an applicant&apos;s electricity-consumption history to help evaluate suitable solar solutions. All analysis is based on actual submitted or manually entered data — we do not fabricate analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-sky-600" /> What We Analyze</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rdAnalysisItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-sky-600" /> What We Generate</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rdChartTypes.map((item) => (
                    <li key={item.label} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <span className="text-slate-500"> — {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-sky-50 to-amber-50 border-sky-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-3">How It Works</h3>
              <div className="space-y-4 text-slate-600">
                <p className="leading-relaxed">
                  Customers can submit 2–5 years of electricity bills where available. We also support shorter periods if the customer does not have complete records. Our R&D team reviews the data, generates visual charts and analysis, and explains the findings to the customer in simple language.
                </p>
                <p className="leading-relaxed">
                  After analysis, the team provides a professional explanation of the findings, including estimated solar system size, potential generation, grid offset, savings, and payback period — all based on the actual data provided.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/energy-analysis">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                    Submit Your Bills for Analysis <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/solar-calculator">
                  <Button variant="outline">
                    Try Solar Calculator <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Our Projects</h3>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-lg bg-slate-100 animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-slate-500">No projects to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={project.status === 'completed' ? 'default' : project.status === 'in_progress' ? 'secondary' : 'outline'}>
                        {project.status === 'completed' ? 'Completed' : project.status === 'in_progress' ? 'In Progress' : 'Planning'}
                      </Badge>
                      {project.location && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>}
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">{project.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{project.description}</p>
                    {project.services && (
                      <p className="text-xs text-slate-500"><strong>Services:</strong> {project.services}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
