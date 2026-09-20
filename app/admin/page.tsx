'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Clock, CheckCircle2, Wrench, Users, Package,
  Loader2, Bell, Settings, Plus, Edit, Trash2, X, Sun,
  Thermometer, BarChart3, TrendingUp, MapPin, AlertCircle,
  UserCog, FileSpreadsheet, LayoutDashboard, Search
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
import { supabase, type Application, type ContactEnquiry, type FAQ, type Project, type Tender, type GovInfo, type ServiceEnquiry, type EnergyAnalysis, type District, type SolarCalculationAssumption, type CmsContent, type Profile } from '@/lib/supabase/client';
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

const tenderStatuses = ['draft', 'published', 'open', 'closed', 'awarded', 'in_progress', 'completed', 'archived'];

const coverageStatuses = [
  { value: 'active_service_area', label: 'Active Service Area' },
  { value: 'service_available_on_request', label: 'Service Available on Request' },
  { value: 'planned_coverage', label: 'Planned Coverage' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [serviceEnquiries, setServiceEnquiries] = useState<ServiceEnquiry[]>([]);
  const [energyAnalyses, setEnergyAnalyses] = useState<EnergyAnalysis[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [govInfo, setGovInfo] = useState<GovInfo[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [assumptions, setAssumptions] = useState<SolarCalculationAssumption[]>([]);
  const [cmsContents, setCmsContents] = useState<CmsContent[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [newProject, setNewProject] = useState({ title: '', location: '', description: '', services: '' });
  const [newTender, setNewTender] = useState({ title: '', department: '', organization: '', tender_number: '', reference_number: '', location: '', project_description: '', published_date: '', submission_deadline: '', status: 'draft', internal_notes: '' });
  const [newDistrict, setNewDistrict] = useState({ name: '', region: '', coverage_status: 'planned_coverage', available_services: '' });
  const [editingAssumption, setEditingAssumption] = useState<Record<string, string>>({});
  const [editingGovInfo, setEditingGovInfo] = useState<Record<string, string>>({});
  const [newCms, setNewCms] = useState({ page_key: '', section_key: '', content_key: '', content_value: '' });

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin') || !profile) return;
    (async () => {
      const { data: apps } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      setApplications((apps || []) as Application[]);
      const { data: enq } = await supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false });
      setEnquiries((enq || []) as ContactEnquiry[]);
      const { data: sq } = await supabase.from('service_enquiries').select('*').order('created_at', { ascending: false });
      setServiceEnquiries((sq || []) as ServiceEnquiry[]);
      const { data: ea } = await supabase.from('energy_analyses').select('*').order('created_at', { ascending: false });
      setEnergyAnalyses((ea || []) as EnergyAnalysis[]);
      const { data: fq } = await supabase.from('faqs').select('*').order('sort_order');
      setFaqs((fq || []) as FAQ[]);
      const { data: pj } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects((pj || []) as Project[]);
      const { data: td } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      setTenders((td || []) as Tender[]);
      const { data: gi } = await supabase.from('government_information').select('*');
      setGovInfo((gi || []) as GovInfo[]);
      const { data: dist } = await supabase.from('districts').select('*').order('display_order');
      setDistricts((dist || []) as District[]);
      const { data: asm } = await supabase.from('solar_calculation_assumptions').select('*');
      setAssumptions((asm || []) as SolarCalculationAssumption[]);
      const { data: cms } = await supabase.from('cms_content').select('*').order('page_key');
      setCmsContents((cms || []) as CmsContent[]);
      const { data: prof } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles((prof || []) as Profile[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const updateAppStatus = async (appId: string, status: string) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) { toast({ title: 'Update failed', variant: 'destructive' }); return; }
    await supabase.from('application_status_history').insert({ application_id: appId, status, comment: `Status updated to ${statusLabels[status]}` });
    setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: status as Application['status'] } : a));
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
    const { error } = await supabase.from('tenders').insert({
      ...newTender,
      status: newTender.status as Tender['status'],
      is_published: newTender.status !== 'draft',
    });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Tender added' });
    setNewTender({ title: '', department: '', organization: '', tender_number: '', reference_number: '', location: '', project_description: '', published_date: '', submission_deadline: '', status: 'draft', internal_notes: '' });
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders((data || []) as Tender[]);
  };

  const updateTenderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('tenders').update({ status: status as Tender['status'], is_published: status !== 'draft' && status !== 'archived' }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Tender status updated' });
    const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
    setTenders((data || []) as Tender[]);
  };

  const deleteTender = async (id: string) => {
    await supabase.from('tenders').delete().eq('id', id);
    setTenders(tenders.filter(t => t.id !== id));
    toast({ title: 'Tender deleted' });
  };

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

  const updateDistrictStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('districts').update({ coverage_status: status as District['coverage_status'] }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'District updated' });
    const { data } = await supabase.from('districts').select('*').order('display_order');
    setDistricts((data || []) as District[]);
  };

  const updateDistrictActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('districts').update({ is_active: active }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: active ? 'District activated' : 'District deactivated' });
    const { data } = await supabase.from('districts').select('*').order('display_order');
    setDistricts((data || []) as District[]);
  };

  const updateAssumption = async (id: string) => {
    const val = editingAssumption[id];
    if (!val) return;
    const { error } = await supabase.from('solar_calculation_assumptions').update({ value: parseFloat(val) }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setAssumptions(asm => asm.map(a => a.id === id ? { ...a, value: parseFloat(val) } : a));
    setEditingAssumption(prev => { const c = { ...prev }; delete c[id]; return c; });
    toast({ title: 'Assumption updated' });
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

  const addCmsContent = async () => {
    if (!newCms.page_key || !newCms.section_key || !newCms.content_key) return;
    const { error } = await supabase.from('cms_content').insert({
      page_key: newCms.page_key,
      section_key: newCms.section_key,
      content_key: newCms.content_key,
      content_value: newCms.content_value,
      is_published: true,
    });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Content added' });
    setNewCms({ page_key: '', section_key: '', content_key: '', content_value: '' });
    const { data } = await supabase.from('cms_content').select('*').order('page_key');
    setCmsContents((data || []) as CmsContent[]);
  };

  const updateCmsContent = async (id: string, value: string) => {
    const { error } = await supabase.from('cms_content').update({ content_value: value }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setCmsContents(cms => cms.map(c => c.id === id ? { ...c, content_value: value } : c));
    toast({ title: 'Content updated' });
  };

  const updateServiceEnquiryStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('service_enquiries').update({ status }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setServiceEnquiries(sq => sq.map(s => s.id === id ? { ...s, status: status as ServiceEnquiry['status'] } : s));
    toast({ title: 'Enquiry status updated' });
  };

  const updateProfileRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setProfiles(profs => profs.map(p => p.id === id ? { ...p, role: role as Profile['role'] } : p));
    toast({ title: 'User role updated' });
  };

  const toggleSuspend = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_suspended: !current }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setProfiles(profs => profs.map(p => p.id === id ? { ...p, is_suspended: !current } : p));
    toast({ title: !current ? 'User suspended' : 'User activated' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  const filteredApps = applications.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterDistrict !== 'all' && a.district !== filterDistrict) return false;
    if (searchQuery && !a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.application_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalUsers: profiles.length,
    activeUsers: profiles.filter(p => !p.is_suspended).length,
    newUsers: profiles.filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    total: applications.length,
    pending: applications.filter(a => a.status === 'NEW' || a.status === 'UNDER_REVIEW').length,
    completed: applications.filter(a => a.status === 'COMPLETED').length,
    enquiries: enquiries.filter(e => e.status === 'new').length,
    waterHeaterEnquiries: serviceEnquiries.filter(e => e.service_type === 'solar_water_heater').length,
    energyRequests: energyAnalyses.length,
    activeTenders: tenders.filter(t => t.status !== 'archived' && t.status !== 'draft').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage users, applications, content, and system settings.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users"><Button variant="outline" size="sm"><UserCog className="h-4 w-4 mr-1" /> Users</Button></Link>
            <Link href="/admin/tenders"><Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Tenders</Button></Link>
            <Link href="/admin/districts"><Button variant="outline" size="sm"><MapPin className="h-4 w-4 mr-1" /> Districts</Button></Link>
            <Link href="/admin/cms"><Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1" /> CMS</Button></Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
            { label: 'New Users', value: stats.newUsers, icon: UserCog, color: 'sky' },
            { label: 'Applications', value: stats.total, icon: FileText, color: 'amber' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'green' },
            { label: 'Enquiries', value: stats.enquiries, icon: Bell, color: 'red' },
            { label: 'Water Heater', value: stats.waterHeaterEnquiries, icon: Thermometer, color: 'orange' },
            { label: 'Energy Analysis', value: stats.energyRequests, icon: BarChart3, color: 'sky' },
            { label: 'Active Tenders', value: stats.activeTenders, icon: FileText, color: 'amber' },
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
            <TabsTrigger value="service-enquiries">Service Enquiries</TabsTrigger>
            <TabsTrigger value="energy">Energy Analysis</TabsTrigger>
            <TabsTrigger value="enquiries">Contact Enquiries</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tenders">Tenders</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="govinfo">Gov Info</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="cms">CMS</TabsTrigger>
          </TabsList>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications ({filteredApps.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="District" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statusOptions.map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {filteredApps.length === 0 ? <p className="text-center text-slate-500 py-8">No applications found.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>App ID</TableHead><TableHead>Customer</TableHead><TableHead>Location</TableHead>
                          <TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApps.map((app) => (
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

          {/* Service Enquiries (Solar Water Heater) */}
          <TabsContent value="service-enquiries">
            <Card>
              <CardHeader><CardTitle>Service Enquiries ({serviceEnquiries.length})</CardTitle></CardHeader>
              <CardContent>
                {serviceEnquiries.length === 0 ? <p className="text-center text-slate-500 py-8">No service enquiries.</p> : (
                  <div className="space-y-3">
                    {serviceEnquiries.map((enq) => (
                      <div key={enq.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{enq.name}</span>
                          <Badge variant={enq.status === 'completed' ? 'default' : 'secondary'}>{enq.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <span>Service: {enq.service_type.replace(/_/g, ' ')}</span>
                          <span>Phone: {enq.phone}</span>
                          {enq.email && <span>Email: {enq.email}</span>}
                          {enq.property_type && <span>Property: {enq.property_type}</span>}
                          {enq.num_people && <span>People: {enq.num_people}</span>}
                          {enq.hot_water_requirement && <span>Hot Water: {enq.hot_water_requirement} L/day</span>}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{enq.address}</p>
                        {enq.message && <p className="text-sm text-slate-500 mt-1 italic">{enq.message}</p>}
                        <div className="mt-3">
                          <Select onValueChange={(v) => updateServiceEnquiryStatus(enq.id, v)}>
                            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Update Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Energy Analysis */}
          <TabsContent value="energy">
            <Card>
              <CardHeader><CardTitle>Energy Analysis Submissions ({energyAnalyses.length})</CardTitle></CardHeader>
              <CardContent>
                {energyAnalyses.length === 0 ? <p className="text-center text-slate-500 py-8">No energy analysis submissions.</p> : (
                  <div className="space-y-3">
                    {energyAnalyses.map((ea) => (
                      <div key={ea.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={ea.status === 'completed' ? 'default' : 'secondary'}>{ea.status.replace(/_/g, ' ')}</Badge>
                          <span className="text-xs text-slate-500">{new Date(ea.submitted_at).toLocaleDateString()}</span>
                        </div>
                        {ea.analysis_period_start && ea.analysis_period_end && (
                          <p className="text-sm text-slate-600">Period: {new Date(ea.analysis_period_start).toLocaleDateString()} — {new Date(ea.analysis_period_end).toLocaleDateString()}</p>
                        )}
                        {ea.data_availability_note && <p className="text-xs text-slate-500 mt-1">{ea.data_availability_note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Enquiries */}
          <TabsContent value="enquiries">
            <Card>
              <CardHeader><CardTitle>Contact Enquiries ({enquiries.length})</CardTitle></CardHeader>
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

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Users ({profiles.length})</CardTitle></CardHeader>
              <CardContent>
                {profiles.length === 0 ? <p className="text-center text-slate-500 py-8">No users.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.full_name}</TableCell>
                            <TableCell className="text-xs">{p.email}</TableCell>
                            <TableCell className="text-xs">{p.phone || '-'}</TableCell>
                            <TableCell>
                              <Select defaultValue={p.role} onValueChange={(v) => updateProfileRole(p.id, v)}>
                                <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={p.is_suspended ? 'destructive' : 'default'}>{p.is_suspended ? 'Suspended' : 'Active'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => toggleSuspend(p.id, p.is_suspended)}>
                                {p.is_suspended ? 'Activate' : 'Suspend'}
                              </Button>
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
                  <Input placeholder="Organization" value={newTender.organization} onChange={(e) => setNewTender({ ...newTender, organization: e.target.value })} />
                  <Input placeholder="Reference #" value={newTender.reference_number} onChange={(e) => setNewTender({ ...newTender, reference_number: e.target.value })} />
                  <Input placeholder="Location" value={newTender.location} onChange={(e) => setNewTender({ ...newTender, location: e.target.value })} />
                  <Input placeholder="Published date" type="date" value={newTender.published_date} onChange={(e) => setNewTender({ ...newTender, published_date: e.target.value })} />
                  <Input placeholder="Submission deadline" type="date" value={newTender.submission_deadline} onChange={(e) => setNewTender({ ...newTender, submission_deadline: e.target.value })} />
                </div>
                <Textarea placeholder="Project description" value={newTender.project_description} onChange={(e) => setNewTender({ ...newTender, project_description: e.target.value })} />
                <Textarea placeholder="Internal notes" value={newTender.internal_notes} onChange={(e) => setNewTender({ ...newTender, internal_notes: e.target.value })} />
                <Select value={newTender.status} onValueChange={(v) => setNewTender({ ...newTender, status: v })}>
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
                  {tenders.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.title}</p>
                          {t.organization && <p className="text-xs text-slate-600">{t.organization}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue={t.status} onValueChange={(v) => updateTenderStatus(t.id, v)}>
                            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {tenderStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => deleteTender(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </div>
                      {t.reference_number && <p className="text-xs text-slate-500">Ref: {t.reference_number}</p>}
                      {t.is_published === false && <Badge variant="outline" className="mt-1">Unpublished</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Districts */}
          <TabsContent value="districts">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add District</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="District name" value={newDistrict.name} onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })} />
                <Input placeholder="Region" value={newDistrict.region} onChange={(e) => setNewDistrict({ ...newDistrict, region: e.target.value })} />
                <Input placeholder="Available services (comma-separated)" value={newDistrict.available_services} onChange={(e) => setNewDistrict({ ...newDistrict, available_services: e.target.value })} />
                <Select value={newDistrict.coverage_status} onValueChange={(v) => setNewDistrict({ ...newDistrict, coverage_status: v })}>
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
                  {districts.map((d) => (
                    <div key={d.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{d.name}</p>
                          {d.region && <p className="text-xs text-slate-500">{d.region}</p>}
                        </div>
                        <Badge variant={d.is_active ? 'default' : 'outline'}>{d.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      {d.available_services && d.available_services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {d.available_services.map((s, i) => <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>)}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Select defaultValue={d.coverage_status} onValueChange={(v) => updateDistrictStatus(d.id, v)}>
                          <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {coverageStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => updateDistrictActive(d.id, !d.is_active)}>
                          {d.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gov Info */}
          <TabsContent value="govinfo">
            <Card>
              <CardHeader><CardTitle>Government Scheme Information</CardTitle></CardHeader>
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

          {/* Calculator Assumptions */}
          <TabsContent value="calculator">
            <Card>
              <CardHeader><CardTitle>Calculator Assumptions</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assumptions.map((a) => (
                    <div key={a.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{a.label}</p>
                        <p className="text-xs text-slate-500">{a.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" step="0.01" value={editingAssumption[a.id] ?? String(a.value)} onChange={e => setEditingAssumption({ ...editingAssumption, [a.id]: e.target.value })} className="w-24" />
                        <span className="text-xs text-slate-500">{a.unit}</span>
                        <Button size="sm" variant="outline" onClick={() => updateAssumption(a.id)}>Update</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CMS */}
          <TabsContent value="cms">
            <Card className="mb-4">
              <CardHeader><CardTitle>Add CMS Content</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Page key" value={newCms.page_key} onChange={e => setNewCms({ ...newCms, page_key: e.target.value })} />
                  <Input placeholder="Section key" value={newCms.section_key} onChange={e => setNewCms({ ...newCms, section_key: e.target.value })} />
                  <Input placeholder="Content key" value={newCms.content_key} onChange={e => setNewCms({ ...newCms, content_key: e.target.value })} />
                </div>
                <Textarea placeholder="Content value" value={newCms.content_value} onChange={e => setNewCms({ ...newCms, content_value: e.target.value })} />
                <Button onClick={addCmsContent} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add Content</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>CMS Content ({cmsContents.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cmsContents.map((c) => (
                    <div key={c.id} className="rounded-lg border p-3">
                      <p className="text-xs font-mono text-amber-600 mb-1">{c.page_key} / {c.section_key} / {c.content_key}</p>
                      <Textarea defaultValue={c.content_value || ''} onBlur={e => updateCmsContent(c.id, e.target.value)} rows={2} />
                    </div>
                  ))}
                  {cmsContents.length === 0 && <p className="text-center text-slate-500 py-4">No CMS content yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
