'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, MapPin, User, Phone, Calendar, CheckCircle2,
  Circle, Loader2, Camera, ClipboardCheck, Home, Zap, Sun,
  Wrench, FileText, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/context';
import { supabase, type Application, type Installation, type ChecklistItem } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const checklistItems = [
  'Site inspected', 'Roof checked', 'Electrical system checked',
  'Equipment delivered', 'Mounting completed', 'Solar panels installed',
  'Inverter installed', 'Wiring completed', 'Safety checks completed',
  'Documentation uploaded', 'Installation completed',
];

export default function StaffDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [assignedApps, setAssignedApps] = useState<Application[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'staff' && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'staff' && profile.role !== 'admin')) return;
    (async () => {
      const { data: apps } = await supabase.from('applications').select('*').eq('assigned_staff_id', user.id).order('created_at', { ascending: false });
      setAssignedApps((apps || []) as Application[]);

      const { data: insts } = await supabase.from('installations').select('*').or(`assigned_staff_id.eq.${user.id}`).order('created_at', { ascending: false });
      setInstallations((insts || []) as Installation[]);

      for (const inst of (insts || []) as Installation[]) {
        const { data: cl } = await supabase.from('installation_checklist').select('*').eq('installation_id', inst.id);
        setChecklists(prev => ({ ...prev, [inst.id]: (cl || []) as ChecklistItem[] }));
      }
      setDataLoading(false);
    })();
  }, [user, profile]);

  const toggleChecklistItem = async (instId: string, itemId: string, current: boolean) => {
    const { error } = await supabase.from('installation_checklist').update({ completed: !current, completed_at: !current ? new Date().toISOString() : null }).eq('id', itemId);
    if (error) { toast({ title: 'Update failed', variant: 'destructive' }); return; }
    setChecklists(prev => ({
      ...prev,
      [instId]: (prev[instId] || []).map(c => c.id === itemId ? { ...c, completed: !current } : c),
    }));
    toast({ title: !current ? 'Task completed' : 'Task uncompleted' });
  };

  const saveNote = async (instId: string) => {
    const note = notes[instId];
    if (!note) return;
    const { error } = await supabase.from('installations').update({ notes: note }).eq('id', instId);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Note saved' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Assigned installations and field work.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100"><ClipboardList className="h-5 w-5 text-amber-600" /></div><div><p className="text-2xl font-bold text-slate-900">{assignedApps.length}</p><p className="text-xs text-slate-500">Assigned</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><Calendar className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-900">{installations.filter(i => i.status === 'SCHEDULED').length}</p><p className="text-xs text-slate-500">Scheduled</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"><Wrench className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-slate-900">{installations.filter(i => i.status === 'IN_PROGRESS').length}</p><p className="text-xs text-slate-500">In Progress</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold text-slate-900">{installations.filter(i => i.status === 'COMPLETED').length}</p><p className="text-xs text-slate-500">Completed</p></div></div></CardContent></Card>
        </div>

        {/* Assigned Customers */}
        <Card className="mb-6">
          <CardHeader><CardTitle>Assigned Customers</CardTitle></CardHeader>
          <CardContent>
            {assignedApps.length === 0 ? <p className="text-center text-slate-500 py-8">No assigned customers.</p> : (
              <div className="space-y-3">
                {assignedApps.map((app) => (
                  <div key={app.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{app.full_name}</span>
                      </div>
                      <Badge variant="secondary">{app.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {app.mobile_number}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {app.village_town}, {app.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Installations */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Installation Checklists</h2>
        {installations.length === 0 ? (
          <Card><CardContent className="pt-12 pb-12 text-center"><ClipboardCheck className="mx-auto h-12 w-12 text-slate-300 mb-3" /><p className="text-slate-500">No installations assigned.</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {installations.map((inst) => {
              const items = checklists[inst.id] || [];
              const completedCount = items.filter(i => i.completed).length;
              const app = assignedApps.find(a => a.id === inst.application_id);
              return (
                <Card key={inst.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{app?.full_name || 'Installation'}</span>
                      <Badge variant={inst.status === 'COMPLETED' ? 'default' : 'secondary'}>{inst.status}</Badge>
                    </CardTitle>
                    {inst.scheduled_date && <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Scheduled: {new Date(inst.scheduled_date).toLocaleDateString()}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${items.length ? (completedCount / items.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{completedCount}/{items.length}</span>
                    </div>

                    {/* Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {checklistItems.map((item, idx) => {
                        const dbItem = items.find(i => i.item === item);
                        const completed = dbItem?.completed || false;
                        return (
                          <button
                            key={item}
                            onClick={() => dbItem && toggleChecklistItem(inst.id, dbItem.id, completed)}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors ${completed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                          >
                            {completed ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-slate-300 shrink-0" />}
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <Textarea placeholder="Add installation notes..." value={notes[inst.id] ?? inst.notes ?? ''} onChange={(e) => setNotes({ ...notes, [inst.id]: e.target.value })} rows={2} />
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => saveNote(inst.id)}>Save Note</Button>
                    </div>

                    {/* Upload */}
                    <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center">
                      <Camera className="mx-auto h-6 w-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500">Upload site photos</p>
                      <input type="file" multiple accept="image/*" className="text-xs mt-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
