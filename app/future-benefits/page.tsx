'use client';

import Link from 'next/link';
import { Sun, TrendingDown, Clock, Zap, DollarSign, Leaf, Home, Users, Briefcase, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Disclaimer from '@/components/shared/Disclaimer';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const benefits = [
  { icon: TrendingDown, title: 'Potential Reduction in Electricity Bills', desc: 'Solar panels generate electricity from sunlight, which may reduce the amount of grid electricity you need to purchase, potentially lowering your monthly bills.' },
  { icon: Clock, title: 'Long-Term Energy Planning', desc: 'A solar system can provide electricity for 25+ years, helping you plan your long-term energy costs with more predictability.' },
  { icon: Sun, title: 'Renewable Energy Generation', desc: 'Solar energy is a renewable resource — it is naturally replenished and does not run out, unlike fossil fuels.' },
  { icon: Zap, title: 'Reduced Dependence on Grid Electricity', desc: 'A portion of your daily electricity consumption can potentially be met by solar generation, reducing your reliance on grid supply.' },
  { icon: DollarSign, title: 'Potential Long-Term Financial Value', desc: 'Over time, the savings from reduced grid electricity purchases may contribute to the financial value of your investment.' },
  { icon: Leaf, title: 'Cleaner-Energy Adoption', desc: 'Solar generation produces no direct emissions, contributing to cleaner air and reduced greenhouse gas emissions.' },
  { icon: Home, title: 'Benefits for Homes and Communities', desc: 'Solar adoption can contribute to energy awareness and resilience at both household and community levels.' },
  { icon: Briefcase, title: 'Potential Support for Local Technical Employment', desc: 'Solar installation and maintenance work may support local technical jobs and skill development in the region.' },
];

const costComparisonData = [
  { scenario: 'Year 1', current: 24000, solar: 8000 },
  { scenario: 'Year 5', current: 29000, solar: 9500 },
  { scenario: 'Year 10', current: 37000, solar: 12000 },
  { scenario: 'Year 15', current: 47000, solar: 15000 },
  { scenario: 'Year 20', current: 60000, solar: 19000 },
];

const energyMixData = [
  { name: 'Solar Generation', value: 65, color: '#f59e0b' },
  { name: 'Grid Electricity', value: 35, color: '#3b82f6' },
];

export default function FutureBenefitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white mb-4 hover:bg-white/30">Solar Education</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Future Benefits of Going Solar</h1>
            <p className="text-lg text-green-50">
              Understanding the potential long-term advantages of adopting solar energy for your home or business.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => {
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
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Visualizing the Potential</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Estimated Cost Comparison Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#ef4444" name="Without Solar" />
                    <Bar dataKey="solar" fill="#10b981" name="With Solar" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-2 text-center">Illustrative comparison only — actual figures depend on your usage and conditions.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Energy Mix with Solar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={energyMixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {energyMixData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-500 mt-2 text-center">Illustrative example — actual mix depends on system size and consumption.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-2">Important: Benefits Are Not Guaranteed</p>
                <p className="text-sm text-amber-800 leading-relaxed mb-2">
                  The benefits described above are potential advantages, not guaranteed outcomes. Actual results depend on:
                </p>
                <ul className="text-sm text-amber-800 list-disc pl-5 space-y-1">
                  <li>System size and design</li>
                  <li>Your electricity usage patterns</li>
                  <li>Available sunlight at your location</li>
                  <li>Electricity tariffs and rates</li>
                  <li>System maintenance and performance</li>
                  <li>Applicable government regulations and policies</li>
                </ul>
                <p className="text-sm text-amber-800 leading-relaxed mt-2">
                  We do not claim guaranteed zero electricity bills, guaranteed savings, guaranteed subsidy, guaranteed payback period, or complete energy independence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore Solar?</h2>
          <p className="text-green-50 mb-8 max-w-2xl mx-auto">Use our calculator to estimate your potential savings, or start your solar installation request today.</p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/solar-calculator">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                Try Solar Calculator <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/apply">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Apply for Installation
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
