'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Clock, CheckCircle2, Wrench, Users, Package,
  Loader2, Bell, Settings, Plus, Edit, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { supabase, type Application, type ContactEnquiry, type FAQ, type Project, type Tender, type GovInfo } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  NEW: 'New', UNDER_REVIEW: 'Under Review', DOCUMENTS_REQUIRED: 'Docs Required',
  SITE_ASSESSMENT_PENDING: 'Assessment Pending', SITE_ASSESSMENT_COMPLETED: 'Assessment Done',
  APPLICATION_ASSISTANCE: 'App Assistance', INSTALLATION_SCHEDULED: 'Scheduled',
  INSTALLATION_IN_PROGRESS: 'In Progress', INSTALLATION_COMPLETED: 'Installed',
  INSPECTION_PENDING: 'Inspection Pending', COMMISSIONING_PENDING: 'Commissioning Pending',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const statusOptions = Object.keys(statusLabels);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [govInfo, setGovInfo] = useState<GovInfo[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [newProject, setNewProject] = useState({ title: '', location: '', description: '', services: '' });
  const [newTender, setNewTender] = useState({ title: '', department: '', tender_number: '', location: '', published_date: '', closing_date: '' });
  const [editingGovInfo, setEditingGovInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) return;
    (async () => {
      const { data: apps } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      setApplications((apps || []) as Application[]);
      const { data: enq } = await supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false });
      setEnquiries((enq || []) as ContactEnquiry[]);
      const { data: fq } = await supabase.from('faqs').select('*').order('sort_order');
      setFaqs((fq || []) as FAQ[]);
      const { data: pj } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects((pj || []) as Project[]);
      const { data: td } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      setTenders((td || []) as Tender[]);
      const { data: gi } = await supabase.from('government_information').select('*');
      setGovInfo((gi || []) as GovInfo[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const updateAppStatus = async (appId: string, status: string) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) { toast({ title: 'Update failed', variant: 'destructive' }); return; }
    await supabase.from('application_status_history').insert({ application_id: appId, status, comment: `Status updated to ${statusLabels[status]}` });
    setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: status as any } : a));
    toast({ title: 'Status updated' });
  };

  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    const { error } = await supabase.from('faqs').insert({ ...newFaq, sort_order: faqs.length + 1 });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'FAQ added' });
    setNewFaq({ question: '', answer: '', category: 'general' });
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setFaqs((data || []) as FAQ[]);
  };

  const deleteFaq = async (id: string) => {
    await supabase.from('faqs').delete().eq('id', id);
    setFaqs(faqs.filter(f => f.id !== id));
    toast({ title: 'FAQ deleted' });
  };

  const addProject = async () => {
    if (!newProject.title) return;
    const { error } = await supabase.from('projects').insert({ ...newProject, status: 'completed' });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Project added' });
    setNewProject({ title: '', location: '', description: '', services: '' });
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects((data || []) as Project[]);
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
    toast({ title: 'Project deleted' });
  };

  const addTender = async () => {
    if (!newTender.title) return;
    const { error } = await supabase.from('tenders').insert({ ...newTender, status: 'active' });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Tender added' });
    setNewTender({ title: '', department: '', tender_number: '', location: '', published_date: '', closing_date: '' });
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders((data || []) as Tender[]);
  };

  const deleteTender = async (id: string) => {
    await supabase.from('tenders').delete().eq('id', id);
    setTenders(tenders.filter(t => t.id !== id));
    toast({ title: 'Tender deleted' });
  };

  const updateGovInfo = async (id: string) => {
    const content = editingGovInfo[id];
    if (!content) return;
    const { error } = await supabase.from('government_information').update({ content }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setGovInfo(gi => gi.map(g => g.id === id ? { ...g, content } : g));
    setEditingGovInfo(prev => { const c = { ...prev }; delete c[id]; return c; });
    toast({ title: 'Government info updated' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'NEW').length,
    review: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    assessment: applications.filter(a => a.status === 'SITE_ASSESSMENT_PENDING').length,
    scheduled: applications.filter(a => a.status === 'INSTALLATION_SCHEDULED').length,
    completed: applications.filter(a => a.status === 'COMPLETED').length,
    enquiries: enquiries.filter(e => e.status === 'new').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage applications, content, and system settings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'amber' },
            { label: 'New', value: stats.new, icon: Package, color: 'blue' },
            { label: 'Review', value: stats.review, icon: Clock, color: 'purple' },
            { label: 'Assessment', value: stats.assessment, icon: Users, color: 'sky' },
            { label: 'Scheduled', value: stats.scheduled, icon: Wrench, color: 'green' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'green' },
            { label: 'Enquiries', value: stats.enquiries, icon: Bell, color: 'red' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${s.color}-100 mb-2`}>
                    <Icon className={`h-4 w-4 text-${s.color}-600`} />
                  </div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="applications">
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tenders">Tenders</TabsTrigger>
            <TabsTrigger value="govinfo">Gov Info</TabsTrigger>
          </TabsList>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
              <CardContent>
                {applications.length === 0 ? <p className="text-center text-slate-500 py-8">No applications.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>App ID</TableHead><TableHead>Customer</TableHead><TableHead>Location</TableHead>
                          <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono text-xs text-amber-600">{app.application_id}</TableCell>
                            <TableCell>{app.full_name}</TableCell>
                            <TableCell className="text-xs">{app.village_town}, {app.district}</TableCell>
                            <TableCell className="text-xs">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant="secondary">{statusLabels[app.status] || app.status}</Badge></TableCell>
                            <TableCell>
                              <Select onValueChange={(v) => updateAppStatus(app.id, v)}>
                                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enquiries */}
          <TabsContent value="enquiries">
            <Card>
              <CardHeader><CardTitle>Contact Enquiries</CardTitle></CardHeader>
              <CardContent>
                {enquiries.length === 0 ? <p className="text-center text-slate-500 py-8">No enquiries.</p> : (
                  <div className="space-y-3">
                    {enquiries.map((enq) => (
                      <div key={enq.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{enq.name}</span>
                          <Badge variant={enq.status === 'new' ? 'default' : 'secondary'}>{enq.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{enq.message}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          {enq.phone && <span>{enq.phone}</span>}
                          {enq.email && <span>{enq.email}</span>}
                          {enq.location && <span>{enq.location}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs */}
          <TabsContent value="faqs">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add New FAQ</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Question" value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} />
                <Textarea placeholder="Answer" value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} />
                <div className="flex gap-3">
                  <Input placeholder="Category" value={newFaq.category} onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })} />
                  <Button onClick={addFaq} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Existing FAQs ({faqs.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{faq.question}</p>
                        <p className="text-xs text-slate-600 mt-1">{faq.answer}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteFaq(faq.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add New Project</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                <Input placeholder="Location" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
                <Textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                <Input placeholder="Services" value={newProject.services} onChange={(e) => setNewProject({ ...newProject, services: e.target.value })} />
                <Button onClick={addProject} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add Project</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Projects ({projects.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                        {p.location && <p className="text-xs text-slate-400 mt-1">{p.location}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteProject(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenders */}
          <TabsContent value="tenders">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add New Tender</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Title" value={newTender.title} onChange={(e) => setNewTender({ ...newTender, title: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Department" value={newTender.department} onChange={(e) => setNewTender({ ...newTender, department: e.target.value })} />
                  <Input placeholder="Tender #" value={newTender.tender_number} onChange={(e) => setNewTender({ ...newTender, tender_number: e.target.value })} />
                  <Input placeholder="Location" value={newTender.location} onChange={(e) => setNewTender({ ...newTender, location: e.target.value })} />
                  <Input placeholder="Published date" type="date" value={newTender.published_date} onChange={(e) => setNewTender({ ...newTender, published_date: e.target.value })} />
                  <Input placeholder="Closing date" type="date" value={newTender.closing_date} onChange={(e) => setNewTender({ ...newTender, closing_date: e.target.value })} />
                </div>
                <Button onClick={addTender} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add Tender</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tenders ({tenders.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenders.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.title}</p>
                        {t.department && <p className="text-xs text-slate-600 mt-1">{t.department}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteTender(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gov Info */}
          <TabsContent value="govinfo">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-amber-500" /> Government Scheme Information</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {govInfo.map((gi) => (
                    <div key={gi.id} className="rounded-lg border p-4">
                      <p className="font-medium text-slate-900 mb-2">{gi.title}</p>
                      <Textarea value={editingGovInfo[gi.id] ?? gi.content} onChange={(e) => setEditingGovInfo({ ...editingGovInfo, [gi.id]: e.target.value })} rows={3} />
                      <Button size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => updateGovInfo(gi.id)}>
                        <Edit className="mr-1.5 h-3.5 w-3.5" /> Update
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
