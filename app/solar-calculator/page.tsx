'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, Save, TrendingUp, Sun, DollarSign, Zap, Clock, Download, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase, type SolarCalculationAssumption, type SolarCalculation } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

interface CalcInputs {
  monthlyBill: number;
  monthlyConsumption: number;
  tariff: number;
  monthsOfData: number;
  systemSizeKW: number;
  monthlySolarGeneration: number;
  systemCost: number;
  subsidyAssumption: number;
  maintenanceCost: number;
  annualCostIncrease: number;
}

export default function SolarCalculatorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assumptions, setAssumptions] = useState<Record<string, number>>({});
  const [savedCalcs, setSavedCalcs] = useState<SolarCalculation[]>([]);
  const [saving, setSaving] = useState(false);
  const [inputs, setInputs] = useState<CalcInputs>({
    monthlyBill: 2000,
    monthlyConsumption: 300,
    tariff: 6.5,
    monthsOfData: 12,
    systemSizeKW: 3,
    monthlySolarGeneration: 360,
    systemCost: 150000,
    subsidyAssumption: 0,
    maintenanceCost: 2000,
    annualCostIncrease: 5,
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('solar_calculation_assumptions').select('*').eq('is_active', true);
      if (data) {
        const map: Record<string, number> = {};
        (data as SolarCalculationAssumption[]).forEach(a => { map[a.key] = a.value; });
        setAssumptions(map);
        setInputs(prev => ({
          ...prev,
          tariff: map.default_tariff || prev.tariff,
          annualCostIncrease: map.annual_cost_increase || prev.annualCostIncrease,
          maintenanceCost: map.annual_maintenance || prev.maintenanceCost,
        }));
      }
      if (user) {
        const { data: calcs } = await supabase.from('solar_calculations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setSavedCalcs((calcs || []) as SolarCalculation[]);
      }
    })();
  }, [user]);

  const results = useMemo(() => {
    const currentMonthlyCost = inputs.monthlyBill;
    const currentAnnualCost = currentMonthlyCost * 12;
    const solarMonthlyGeneration = inputs.monthlySolarGeneration;
    const solarMonthlyValue = solarMonthlyGeneration * inputs.tariff;
    const solarAssistedMonthlyCost = Math.max(0, currentMonthlyCost - solarMonthlyValue);
    const solarAssistedAnnualCost = solarAssistedMonthlyCost * 12 + inputs.maintenanceCost;
    const annualSavings = currentAnnualCost - solarAssistedAnnualCost;
    const netSystemCost = inputs.systemCost - inputs.subsidyAssumption;

    const yearData = [];
    let cumulativeSavings = 0;
    let cumulativeCurrent = 0;
    let cumulativeSolar = 0;
    for (let year = 1; year <= 10; year++) {
      const inflatedCurrentCost = currentAnnualCost * Math.pow(1 + inputs.annualCostIncrease / 100, year - 1);
      const inflatedSolarCost = solarAssistedAnnualCost * Math.pow(1 + inputs.annualCostIncrease / 100, year - 1);
      const yearSavings = inflatedCurrentCost - inflatedSolarCost;
      cumulativeSavings += yearSavings;
      cumulativeCurrent += inflatedCurrentCost;
      cumulativeSolar += inflatedSolarCost;
      yearData.push({
        year: `Year ${year}`,
        current: Math.round(inflatedCurrentCost),
        solar: Math.round(inflatedSolarCost),
        savings: Math.round(yearSavings),
        cumulative: Math.round(cumulativeSavings),
      });
    }

    const paybackYears = annualSavings > 0 ? netSystemCost / annualSavings : 0;
    const fiveYearSavings = yearData.slice(0, 5).reduce((s, d) => s + d.savings, 0);
    const tenYearSavings = cumulativeSavings;
    const energyOffset = inputs.monthlyConsumption > 0 ? Math.min(100, (solarMonthlyGeneration / inputs.monthlyConsumption) * 100) : 0;

    return {
      currentMonthlyCost: Math.round(currentMonthlyCost),
      currentAnnualCost: Math.round(currentAnnualCost),
      solarAssistedMonthlyCost: Math.round(solarAssistedMonthlyCost),
      solarAssistedAnnualCost: Math.round(solarAssistedAnnualCost),
      annualSavings: Math.round(annualSavings),
      fiveYearSavings: Math.round(fiveYearSavings),
      tenYearSavings: Math.round(tenYearSavings),
      systemCost: inputs.systemCost,
      netSystemCost: Math.round(netSystemCost),
      paybackYears: paybackYears.toFixed(1),
      cumulativeSavings: Math.round(cumulativeSavings),
      energyOffset: Math.round(energyOffset),
      yearData,
    };
  }, [inputs]);

  const savingsBreakdown = [
    { name: 'Solar Generation Value', value: results.annualSavings, color: '#10b981' },
    { name: 'System Cost (Net)', value: results.netSystemCost, color: '#ef4444' },
    { name: 'Maintenance', value: inputs.maintenanceCost, color: '#f59e0b' },
  ];

  const monthlyComparison = [
    { month: 'Current', cost: results.currentMonthlyCost },
    { month: 'Solar-Assisted', cost: results.solarAssistedMonthlyCost },
  ];

  const saveCalculation = async () => {
    if (!user) {
      toast({ title: 'Please log in to save your calculation', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('solar_calculations').insert({
        user_id: user.id,
        name: `Calculation ${new Date().toLocaleDateString()}`,
        inputs: inputs as unknown as Record<string, number | string | boolean>,
        results: results as unknown as Record<string, number | string | boolean>,
      });
      if (error) throw error;
      toast({ title: 'Calculation saved!' });
      const { data } = await supabase.from('solar_calculations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setSavedCalcs((data || []) as SolarCalculation[]);
    } catch {
      toast({ title: 'Failed to save calculation', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <section className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white mb-4 hover:bg-white/30">Interactive Tool</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Estimate Your Potential Solar Savings</h1>
            <p className="text-lg text-amber-50">
              Compare your current electricity expenses with an estimated solar-assisted scenario. Adjust the inputs below to see how different system sizes and costs affect your potential savings.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Electricity Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthlyBill">Average Monthly Bill (Rs)</Label>
                  <Input id="monthlyBill" type="number" value={inputs.monthlyBill} onChange={e => setInputs({...inputs, monthlyBill: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="monthlyConsumption">Average Monthly Consumption (kWh)</Label>
                  <Input id="monthlyConsumption" type="number" value={inputs.monthlyConsumption} onChange={e => setInputs({...inputs, monthlyConsumption: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="tariff">Electricity Tariff (Rs/kWh)</Label>
                  <Input id="tariff" type="number" step="0.1" value={inputs.tariff} onChange={e => setInputs({...inputs, tariff: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="monthsOfData">Number of Months of Data</Label>
                  <Input id="monthsOfData" type="number" value={inputs.monthsOfData} onChange={e => setInputs({...inputs, monthsOfData: parseInt(e.target.value) || 0})} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-amber-500" /> Solar System Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="systemSize">Estimated System Size (kW)</Label>
                  <Input id="systemSize" type="number" value={inputs.systemSizeKW} onChange={e => setInputs({...inputs, systemSizeKW: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="solarGen">Estimated Monthly Solar Generation (kWh)</Label>
                  <Input id="solarGen" type="number" value={inputs.monthlySolarGeneration} onChange={e => setInputs({...inputs, monthlySolarGeneration: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="systemCost">Estimated System Cost (Rs)</Label>
                  <Input id="systemCost" type="number" value={inputs.systemCost} onChange={e => setInputs({...inputs, systemCost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="subsidy">Estimated Subsidy Assumption (Rs) — if applicable</Label>
                  <Input id="subsidy" type="number" value={inputs.subsidyAssumption} onChange={e => setInputs({...inputs, subsidyAssumption: parseFloat(e.target.value) || 0})} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="maintenance">Estimated Annual Maintenance Cost (Rs)</Label>
                  <Input id="maintenance" type="number" value={inputs.maintenanceCost} onChange={e => setInputs({...inputs, maintenanceCost: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <Label htmlFor="costIncrease">Annual Electricity Cost Increase (%)</Label>
                  <Input id="costIncrease" type="number" value={inputs.annualCostIncrease} onChange={e => setInputs({...inputs, annualCostIncrease: parseFloat(e.target.value) || 0})} />
                </div>
              </CardContent>
            </Card>

            {user && (
              <Button onClick={saveCalculation} disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Calculation</>}
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-amber-500" /> Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Current Monthly Cost</p>
                    <p className="text-xl font-bold text-slate-900">Rs {results.currentMonthlyCost}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Current Annual Cost</p>
                    <p className="text-xl font-bold text-slate-900">Rs {results.currentAnnualCost}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-xs text-green-600">Solar-Assisted Monthly</p>
                    <p className="text-xl font-bold text-green-700">Rs {results.solarAssistedMonthlyCost}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-xs text-green-600">Annual Savings</p>
                    <p className="text-xl font-bold text-green-700">Rs {results.annualSavings}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <p className="text-xs text-amber-600">5-Year Savings</p>
                    <p className="text-xl font-bold text-amber-700">Rs {results.fiveYearSavings}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <p className="text-xs text-amber-600">10-Year Savings</p>
                    <p className="text-xl font-bold text-amber-700">Rs {results.tenYearSavings}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">System Cost</p>
                    <p className="text-xl font-bold text-slate-900">Rs {results.systemCost}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Net Cost (after subsidy)</p>
                    <p className="text-xl font-bold text-slate-900">Rs {results.netSystemCost}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 col-span-2">
                    <p className="text-xs text-blue-600">Estimated Payback Period</p>
                    <p className="text-2xl font-bold text-blue-700">{results.paybackYears} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison Chart */}
            <Card>
              <CardHeader><CardTitle>Current vs Solar-Assisted Monthly Cost</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cost" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 10-Year Projection */}
            <Card>
              <CardHeader><CardTitle>10-Year Cumulative Cost Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.yearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#ef4444" name="Current Cost" />
                    <Line type="monotone" dataKey="solar" stroke="#10b981" name="Solar-Assisted Cost" />
                    <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" name="Cumulative Savings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            <Card>
              <CardHeader><CardTitle>Savings Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={savingsBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {savingsBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Energy Offset */}
            <Card>
              <CardHeader><CardTitle>Energy Consumption Offset</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-8 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${results.energyOffset}%` }} />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{results.energyOffset}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Estimated portion of your consumption offset by solar generation</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assumptions */}
        <Card className="mt-8">
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-amber-500" /> Assumptions Used</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(assumptions).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Important Notice</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                These are preliminary estimates based on the information entered. Actual savings, system performance, subsidy, pricing and payback depend on site conditions, system design, electricity tariffs, applicable regulations and verified government information.
              </p>
            </div>
          </div>
        </div>

        {/* Saved Calculations */}
        {user && savedCalcs.length > 0 && (
          <Card className="mt-8">
            <CardHeader><CardTitle>Saved Calculations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {savedCalcs.map((calc) => (
                  <div key={calc.id} className="rounded-lg border p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{calc.name}</p>
                      <p className="text-xs text-slate-500">{new Date(calc.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary">Saved</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <div className="mt-8 text-center">
            <Link href="/apply">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                Request a Site Assessment or Quotation
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
