'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Upload, Plus, Trash2, Edit, CheckCircle2, Clock, FileText, Download, Loader2, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, type EnergyAnalysis, type EnergyBill, type EnergyAnalysisReport } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/hooks/use-toast';
import Disclaimer from '@/components/shared/Disclaimer';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  verified: 'Verified',
  report_generated: 'Report Generated',
  shared: 'Shared with Customer',
  completed: 'Completed',
};

interface BillEntry {
  id?: string;
  billing_month: number;
  billing_year: number;
  units_consumed: string;
  bill_amount: string;
  billing_days: string;
}

export default function EnergyAnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<EnergyAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EnergyAnalysis | null>(null);
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [reports, setReports] = useState<EnergyAnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataNote, setDataNote] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchAnalyses();
    // fetchAnalyses intentionally omitted: it's redefined each render but
    // only needs to re-run when the logged-in user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;
    const { data } = await supabase.from('energy_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnalyses((data || []) as EnergyAnalysis[]);
    setLoading(false);
  };

  const startNewAnalysis = () => {
    setCurrentAnalysis(null);
    setBills([{ billing_month: 1, billing_year: new Date().getFullYear(), units_consumed: '', bill_amount: '', billing_days: '' }]);
    setReports([]);
    setDataNote('');
    setPeriodStart('');
    setPeriodEnd('');
  };

  const addBillRow = () => {
    setBills([...bills, { billing_month: 1, billing_year: new Date().getFullYear(), units_consumed: '', bill_amount: '', billing_days: '' }]);
  };

  const removeBillRow = (idx: number) => {
    setBills(bills.filter((_, i) => i !== idx));
  };

  const updateBillRow = (idx: number, field: keyof BillEntry, value: string) => {
    setBills(bills.map((b, i) => i === idx ? { ...b, [field]: field === 'billing_month' || field === 'billing_year' || field === 'billing_days' ? parseInt(value) || 0 : value } : b));
  };

  const submitAnalysis = async () => {
    if (!user) {
      toast({ title: 'Please log in to submit your energy analysis', variant: 'destructive' });
      return;
    }
    const validBills = bills.filter(b => b.units_consumed && b.bill_amount);
    if (validBills.length === 0) {
      toast({ title: 'Please add at least one bill entry', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: analysisData, error: analysisError } = await supabase.from('energy_analyses').insert({
        user_id: user.id,
        status: 'submitted',
        analysis_period_start: periodStart || null,
        analysis_period_end: periodEnd || null,
        data_availability_note: dataNote || null,
      }).select().single();

      if (analysisError) throw analysisError;
      const analysis = analysisData as EnergyAnalysis;

      const billInserts = validBills.map(b => ({
        energy_analysis_id: analysis.id,
        billing_month: b.billing_month,
        billing_year: b.billing_year,
        units_consumed: parseFloat(b.units_consumed),
        bill_amount: parseFloat(b.bill_amount),
        billing_days: b.billing_days ? parseInt(b.billing_days) : null,
      }));

      const { error: billsError } = await supabase.from('energy_bills').insert(billInserts);
      if (billsError) throw billsError;

      toast({ title: 'Analysis submitted successfully! Our R&D team will review your data.' });
      await fetchAnalyses();
      setCurrentAnalysis(null);
      setBills([]);
    } catch (err) {
      toast({ title: 'Failed to submit analysis. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const loadAnalysis = async (analysis: EnergyAnalysis) => {
    setCurrentAnalysis(analysis);
    const { data: billsData } = await supabase.from('energy_bills').select('*').eq('energy_analysis_id', analysis.id).order('billing_year', { ascending: true }).order('billing_month', { ascending: true });
    setBills((billsData || []).map((b: EnergyBill) => ({
      id: b.id,
      billing_month: b.billing_month,
      billing_year: b.billing_year,
      units_consumed: String(b.units_consumed),
      bill_amount: String(b.bill_amount),
      billing_days: b.billing_days ? String(b.billing_days) : '',
    })));
    const { data: reportData } = await supabase.from('energy_analysis_reports').select('*').eq('energy_analysis_id', analysis.id);
    setReports((reportData || []) as EnergyAnalysisReport[]);
  };

  if (authLoading || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white mb-4 hover:bg-white/30">Energy Analysis</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Analyze Your Electricity Consumption</h1>
            <p className="text-lg text-sky-50">
              Submit your electricity bills for analysis by our R&D team. We study your consumption patterns to help evaluate suitable solar solutions. All analysis is based on your actual data.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {!user ? (
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
              <p className="text-slate-600 mb-6">Please log in to submit your electricity bills for analysis.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login"><Button className="bg-amber-500 hover:bg-amber-600 text-white">Login</Button></Link>
                <Link href="/register"><Button variant="outline">Create Account</Button></Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Existing Analyses */}
            {analyses.length > 0 && !currentAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>My Energy Analyses</span>
                    <Button size="sm" onClick={startNewAnalysis} className="bg-sky-600 hover:bg-sky-700 text-white">
                      <Plus className="h-4 w-4 mr-1" /> New Analysis
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyses.map((a) => (
                      <div key={a.id} className="rounded-lg border p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={a.status === 'completed' ? 'default' : a.status === 'report_generated' ? 'secondary' : 'outline'}>
                              {statusLabels[a.status] || a.status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Submitted: {new Date(a.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          {a.analysis_period_start && a.analysis_period_end && (
                            <p className="text-sm text-slate-600">
                              Period: {new Date(a.analysis_period_start).toLocaleDateString()} — {new Date(a.analysis_period_end).toLocaleDateString()}
                            </p>
                          )}
                          {a.data_availability_note && (
                            <p className="text-xs text-slate-500 mt-1">{a.data_availability_note}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => loadAnalysis(a)}>
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Analysis Form */}
            {currentAnalysis === null && analyses.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Electricity Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="period_start">Analysis Period Start (optional)</Label>
                      <Input id="period_start" type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="period_end">Analysis Period End (optional)</Label>
                      <Input id="period_end" type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="data_note">Data Availability Note</Label>
                    <Textarea id="data_note" value={dataNote} onChange={e => setDataNote(e.target.value)} placeholder="e.g., I have 3 years of bills. Some months are missing." />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-900">Monthly Electricity Data</h3>
                      <Button size="sm" variant="outline" onClick={addBillRow}><Plus className="h-4 w-4 mr-1" /> Add Month</Button>
                    </div>
                    <div className="space-y-3">
                      {bills.map((bill, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end rounded-lg border p-3">
                          <div>
                            <Label className="text-xs">Month</Label>
                            <Select value={String(bill.billing_month)} onValueChange={v => updateBillRow(idx, 'billing_month', v)}>
                              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Year</Label>
                            <Input type="number" value={bill.billing_year} onChange={e => updateBillRow(idx, 'billing_year', e.target.value)} className="h-9" />
                          </div>
                          <div>
                            <Label className="text-xs">Units (kWh)</Label>
                            <Input type="number" value={bill.units_consumed} onChange={e => updateBillRow(idx, 'units_consumed', e.target.value)} className="h-9" placeholder="e.g., 250" />
                          </div>
                          <div>
                            <Label className="text-xs">Bill Amount (Rs)</Label>
                            <Input type="number" value={bill.bill_amount} onChange={e => updateBillRow(idx, 'bill_amount', e.target.value)} className="h-9" placeholder="e.g., 1500" />
                          </div>
                          <div>
                            <Label className="text-xs">Days</Label>
                            <Input type="number" value={bill.billing_days} onChange={e => updateBillRow(idx, 'billing_days', e.target.value)} className="h-9" placeholder="30" />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeBillRow(idx)} className="h-9">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-slate-300 p-4 mb-4">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 text-center">Upload bill images or PDFs (optional)</p>
                    <input type="file" multiple accept="image/*,application/pdf" className="text-xs mt-2 block mx-auto" />
                  </div>

                  <Button onClick={submitAnalysis} disabled={submitting} className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4 mr-2" /> Submit for Analysis</>}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* View Analysis Details */}
            {currentAnalysis && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Analysis Details</h2>
                  <Button variant="outline" size="sm" onClick={() => { setCurrentAnalysis(null); setBills([]); }}>Back</Button>
                </div>
                <Card>
                  <CardHeader><CardTitle>Submitted Data</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Month</th>
                            <th className="text-left py-2">Year</th>
                            <th className="text-left py-2">Units (kWh)</th>
                            <th className="text-left py-2">Amount (Rs)</th>
                            <th className="text-left py-2">Days</th>
                            <th className="text-left py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map((b, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-2">{MONTHS[b.billing_month - 1]}</td>
                              <td className="py-2">{b.billing_year}</td>
                              <td className="py-2">{b.units_consumed}</td>
                              <td className="py-2">{b.bill_amount}</td>
                              <td className="py-2">{b.billing_days || '-'}</td>
                              <td className="py-2"><Badge variant="outline">Pending</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {reports.length > 0 ? (
                  <Card>
                    <CardHeader><CardTitle>Analysis Reports</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reports.map((r) => (
                          <div key={r.id} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={r.is_shared ? 'default' : 'secondary'}>
                                {r.is_shared ? 'Shared' : 'Pending Share'}
                              </Badge>
                              <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            {r.estimated_solar_requirement_kw && (
                              <p className="text-sm text-slate-600">Estimated Solar Requirement: {r.estimated_solar_requirement_kw} kW</p>
                            )}
                            {r.estimated_annual_savings && (
                              <p className="text-sm text-slate-600">Estimated Annual Savings: Rs {r.estimated_annual_savings}</p>
                            )}
                            {r.rd_explanation && (
                              <div className="mt-2 rounded-lg bg-slate-50 p-3">
                                <p className="text-sm text-slate-700">{r.rd_explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <Clock className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-slate-500">Your analysis is being reviewed by our R&D team. Reports will appear here once generated.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Disclaimer />
        </div>
        <p className="text-xs text-slate-500 mt-4 max-w-3xl">
          Disclaimer: All analysis results are estimates based on the data you provide. They are not guaranteed savings or quotations. Actual results depend on site conditions, system design, electricity tariffs, and applicable regulations.
        </p>
      </div>
    </div>
  );
}
