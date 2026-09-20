'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { supabase, type District } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const coverageStatuses = [
  { value: 'active_service_area', label: 'Active Service Area' },
  { value: 'service_available_on_request', label: 'Service Available on Request' },
  { value: 'planned_coverage', label: 'Planned Coverage' },
];

export default function AdminDistrictsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newDistrict, setNewDistrict] = useState({ name: '', region: '', coverage_status: 'planned_coverage', available_services: '' });

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin') || !profile) return;
    (async () => {
      const { data } = await supabase.from('districts').select('*').order('display_order');
      setDistricts((data || []) as District[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const addDistrict = async () => {
    if (!newDistrict.name) return;
    const { error } = await supabase.from('districts').insert({
      name: newDistrict.name,
      region: newDistrict.region || null,
      coverage_status: newDistrict.coverage_status as District['coverage_status'],
      available_services: newDistrict.available_services ? newDistrict.available_services.split(',').map(s => s.trim()) : [],
      display_order: districts.length + 1,
    });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'District added' });
    setNewDistrict({ name: '', region: '', coverage_status: 'planned_coverage', available_services: '' });
    const { data } = await supabase.from('districts').select('*').order('display_order');
    setDistricts((data || []) as District[]);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('districts').update({ coverage_status: status as District['coverage_status'] }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Updated' });
    const { data } = await supabase.from('districts').select('*').order('display_order');
    setDistricts((data || []) as District[]);
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('districts').update({ is_active: !active }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: !active ? 'Activated' : 'Deactivated' });
    const { data } = await supabase.from('districts').select('*').order('display_order');
    setDistricts((data || []) as District[]);
  };

  const deleteDistrict = async (id: string) => {
    const { error } = await supabase.from('districts').delete().eq('id', id);
    if (error) { toast({ title: 'Failed to delete', variant: 'destructive' }); return; }
    setDistricts(districts.filter(d => d.id !== id));
    toast({ title: 'District deleted' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">District Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage service coverage across Meghalaya districts.</p>
          </div>
          <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin</Button></Link>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle>Add District</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="District name" value={newDistrict.name} onChange={e => setNewDistrict({ ...newDistrict, name: e.target.value })} />
            <Input placeholder="Region" value={newDistrict.region} onChange={e => setNewDistrict({ ...newDistrict, region: e.target.value })} />
            <Input placeholder="Available services (comma-separated)" value={newDistrict.available_services} onChange={e => setNewDistrict({ ...newDistrict, available_services: e.target.value })} />
            <Select value={newDistrict.coverage_status} onValueChange={v => setNewDistrict({ ...newDistrict, coverage_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {coverageStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={addDistrict} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add District</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Districts ({districts.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {districts.map(d => (
                <div key={d.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{d.name}</p>
                      {d.region && <p className="text-xs text-slate-500">{d.region}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.is_active ? 'default' : 'outline'}>{d.is_active ? 'Active' : 'Inactive'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteDistrict(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                  {d.available_services && d.available_services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {d.available_services.map((s, i) => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Select defaultValue={d.coverage_status} onValueChange={v => updateStatus(d.id, v)}>
                      <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {coverageStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(d.id, d.is_active)}>
                      {d.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
