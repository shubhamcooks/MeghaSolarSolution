'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Loader2, ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { supabase, type Tender } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const tenderStatuses = ['draft', 'published', 'open', 'closed', 'awarded', 'in_progress', 'completed', 'archived'];

export default function AdminTendersPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newTender, setNewTender] = useState({ title: '', department: '', organization: '', tender_number: '', reference_number: '', location: '', project_description: '', published_date: '', submission_deadline: '', status: 'draft', internal_notes: '' });

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin') || !profile) return;
    (async () => {
      const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      setTenders((data || []) as Tender[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const addTender = async () => {
    if (!newTender.title) return;
    const { error } = await supabase.from('tenders').insert({
      ...newTender, status: newTender.status as Tender['status'], is_published: newTender.status !== 'draft',
    });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Tender added' });
    setNewTender({ title: '', department: '', organization: '', tender_number: '', reference_number: '', location: '', project_description: '', published_date: '', submission_deadline: '', status: 'draft', internal_notes: '' });
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders((data || []) as Tender[]);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('tenders').update({ status: status as Tender['status'], is_published: status !== 'draft' && status !== 'archived' }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Status updated' });
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders((data || []) as Tender[]);
  };

  const deleteTender = async (id: string) => {
    await supabase.from('tenders').delete().eq('id', id);
    setTenders(tenders.filter(t => t.id !== id));
    toast({ title: 'Tender deleted' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tender Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage government tenders and projects.</p>
          </div>
          <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin</Button></Link>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle>Add New Tender</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={newTender.title} onChange={e => setNewTender({ ...newTender, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Department" value={newTender.department} onChange={e => setNewTender({ ...newTender, department: e.target.value })} />
              <Input placeholder="Organization" value={newTender.organization} onChange={e => setNewTender({ ...newTender, organization: e.target.value })} />
              <Input placeholder="Reference #" value={newTender.reference_number} onChange={e => setNewTender({ ...newTender, reference_number: e.target.value })} />
              <Input placeholder="Location" value={newTender.location} onChange={e => setNewTender({ ...newTender, location: e.target.value })} />
              <Input placeholder="Published date" type="date" value={newTender.published_date} onChange={e => setNewTender({ ...newTender, published_date: e.target.value })} />
              <Input placeholder="Submission deadline" type="date" value={newTender.submission_deadline} onChange={e => setNewTender({ ...newTender, submission_deadline: e.target.value })} />
            </div>
            <Textarea placeholder="Project description" value={newTender.project_description} onChange={e => setNewTender({ ...newTender, project_description: e.target.value })} />
            <Textarea placeholder="Internal notes" value={newTender.internal_notes} onChange={e => setNewTender({ ...newTender, internal_notes: e.target.value })} />
            <Select value={newTender.status} onValueChange={v => setNewTender({ ...newTender, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tenderStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={addTender} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add Tender</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tenders ({tenders.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenders.map(t => (
                <div key={t.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.title}</p>
                      {t.organization && <p className="text-xs text-slate-600">{t.organization}</p>}
                      {t.reference_number && <p className="text-xs text-slate-500">Ref: {t.reference_number}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={t.status} onValueChange={v => updateStatus(t.id, v)}>
                        <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {tenderStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => deleteTender(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                  {t.is_published === false && <Badge variant="outline">Unpublished</Badge>}
                </div>
              ))}
              {tenders.length === 0 && <p className="text-center text-slate-500 py-4">No tenders yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
