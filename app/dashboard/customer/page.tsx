'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Clock, CheckCircle2, Bell, Sun, Calculator, BarChart3,
  Wrench, Calendar, User, Settings, Loader2, ArrowRight, Package,
  Thermometer, Lightbulb, Zap, Download, Upload, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { supabase, type Application, type Notification, type SolarCalculation, type EnergyAnalysis, type EnergyAnalysisReport, type ServiceRequest, type Appointment } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  NEW: 'New', UNDER_REVIEW: 'Under Review', DOCUMENTS_REQUIRED: 'Docs Required',
  SITE_ASSESSMENT_PENDING: 'Assessment Pending', SITE_ASSESSMENT_COMPLETED: 'Assessment Done',
  APPLICATION_ASSISTANCE: 'App Assistance', INSTALLATION_SCHEDULED: 'Scheduled',
  INSTALLATION_IN_PROGRESS: 'In Progress', INSTALLATION_COMPLETED: 'Installed',
  INSPECTION_PENDING: 'Inspection Pending', COMMISSIONING_PENDING: 'Commissioning Pending',
  COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

const SERVICE_TYPES = [
  { value: 'solar_installation', label: 'Solar Installation' },
  { value: 'solar_water_heater', label: 'Solar Water Heater' },
  { value: 'repair_service', label: 'Repair / Service' },
  { value: 'solar_street_lamp', label: 'Solar Street Lamps' },
  { value: 'other', label: 'Other Enquiry' },
];

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedCalcs, setSavedCalcs] = useState<SolarCalculation[]>([]);
  const [energyAnalyses, setEnergyAnalyses] = useState<EnergyAnalysis[]>([]);
  const [energyReports, setEnergyReports] = useState<EnergyAnalysisReport[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newServiceType, setNewServiceType] = useState('solar_installation');
  const [serviceDesc, setServiceDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'customer' && profile.role !== 'admin'))) {
      router.push('/login');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: apps } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setApplications((apps || []) as Application[]);
      const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setNotifications((notifs || []) as Notification[]);
      const { data: calcs } = await supabase.from('solar_calculations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setSavedCalcs((calcs || []) as SolarCalculation[]);
      const { data: analyses } = await supabase.from('energy_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setEnergyAnalyses((analyses || []) as EnergyAnalysis[]);
      if (analyses && analyses.length > 0) {
        const { data: reports } = await supabase.from('energy_analysis_reports').select('*').in('energy_analysis_id', analyses.map(a => a.id));
        setEnergyReports((reports || []) as EnergyAnalysisReport[]);
      }
      const { data: srs } = await supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setServiceRequests((srs || []) as ServiceRequest[]);
      const { data: appts } = await supabase.from('appointments').select('*').eq('user_id', user.id).order('scheduled_date', { ascending: true });
      setAppointments((appts || []) as Appointment[]);
      if (profile) setProfileEdit({ full_name: profile.full_name, phone: profile.phone || '', address: profile.address || '' });
      setDataLoading(false);
    })();
  }, [user, profile]);

  const createServiceRequest = async () => {
    if (!user || !serviceDesc) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('service_requests').insert({
        user_id: user.id,
        service_type: newServiceType,
        type: newServiceType,
        description: serviceDesc,
        status: 'OPEN',
      });
      if (error) throw error;
      toast({ title: 'Service request submitted!' });
      setServiceDesc('');
      const { data } = await supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setServiceRequests((data || []) as ServiceRequest[]);
    } catch {
      toast({ title: 'Failed to submit request', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: profileEdit.full_name,
        phone: profileEdit.phone,
        address: profileEdit.address,
      }).eq('id', user.id);
      if (error) throw error;
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifs => notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading || dataLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const activeApps = applications.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.full_name || 'Customer'}</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your applications, services, and account.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100"><FileText className="h-5 w-5 text-amber-600" /></div><div><p className="text-2xl font-bold text-slate-900">{applications.length}</p><p className="text-xs text-slate-500">Applications</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><Clock className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-900">{activeApps.length}</p><p className="text-xs text-slate-500">Active</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold text-slate-900">{applications.filter(a => a.status === 'COMPLETED').length}</p><p className="text-xs text-slate-500">Completed</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100"><Bell className="h-5 w-5 text-red-600" /></div><div><p className="text-2xl font-bold text-slate-900">{unreadNotifs.length}</p><p className="text-xs text-slate-500">Notifications</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="energy">Energy Analysis</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="services">Service Requests</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/apply"><Button variant="outline" className="w-full"><FileText className="h-4 w-4 mr-2" /> New Application</Button></Link>
                    <Link href="/energy-analysis"><Button variant="outline" className="w-full"><BarChart3 className="h-4 w-4 mr-2" /> Submit Bills</Button></Link>
                    <Link href="/solar-calculator"><Button variant="outline" className="w-full"><Calculator className="h-4 w-4 mr-2" /> Calculator</Button></Link>
                    <Link href="/contact"><Button variant="outline" className="w-full"><Bell className="h-4 w-4 mr-2" /> Support</Button></Link>
                  </div>
                </CardContent>
              </Card>

              {activeApps.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Active Applications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activeApps.slice(0, 3).map(app => (
                        <div key={app.id} className="rounded-lg border p-3 flex items-center justify-between">
                          <div>
                            <p className="font-mono text-xs text-amber-600">{app.application_id}</p>
                            <p className="text-sm font-medium text-slate-900">{app.full_name}</p>
                            <p className="text-xs text-slate-500">{app.village_town}, {app.district}</p>
                          </div>
                          <Badge variant="secondary">{statusLabels[app.status] || app.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {unreadNotifs.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Recent Notifications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unreadNotifs.slice(0, 3).map(n => (
                        <div key={n.id} className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          {n.message && <p className="text-xs text-slate-600 mt-1">{n.message}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader><CardTitle>My Applications</CardTitle></CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 mb-4">No applications yet.</p>
                    <Link href="/apply"><Button className="bg-amber-500 hover:bg-amber-600 text-white">Apply Now</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-amber-600">{app.application_id}</span>
                          <Badge variant={app.status === 'COMPLETED' ? 'default' : 'secondary'}>{statusLabels[app.status] || app.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <span>Location: {app.village_town}, {app.district}</span>
                          <span>Type: {app.request_type === 'new_installation' ? 'New Installation' : 'Service'}</span>
                          <span>Submitted: {new Date(app.created_at).toLocaleDateString()}</span>
                          <span>Property: {app.property_type || 'Not specified'}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/track?id=${app.application_id}`}><Button variant="outline" size="sm">Track Status</Button></Link>
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
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Energy Analysis</h3>
                      <p className="text-sm text-slate-500">Submit your electricity bills for R&D analysis</p>
                    </div>
                    <Link href="/energy-analysis"><Button className="bg-sky-600 hover:bg-sky-700 text-white"><Upload className="h-4 w-4 mr-2" /> Submit Bills</Button></Link>
                  </div>
                </CardContent>
              </Card>
              {energyAnalyses.length === 0 ? (
                <Card><CardContent className="pt-6 pb-6 text-center"><BarChart3 className="mx-auto h-10 w-10 text-slate-300 mb-2" /><p className="text-slate-500">No energy analyses submitted yet.</p></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader><CardTitle>Analysis Status</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {energyAnalyses.map(a => (
                        <div key={a.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={a.status === 'completed' ? 'default' : 'secondary'}>{a.status.replace(/_/g, ' ')}</Badge>
                            <span className="text-xs text-slate-500">{new Date(a.submitted_at).toLocaleDateString()}</span>
                          </div>
                          {a.analysis_period_start && a.analysis_period_end && (
                            <p className="text-sm text-slate-600">Period: {new Date(a.analysis_period_start).toLocaleDateString()} — {new Date(a.analysis_period_end).toLocaleDateString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {energyReports.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Reports</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {energyReports.map(r => (
                        <div key={r.id} className="rounded-lg border p-3 flex items-center justify-between">
                          <div>
                            <Badge variant={r.is_shared ? 'default' : 'secondary'}>{r.is_shared ? 'Available' : 'Pending'}</Badge>
                            {r.estimated_solar_requirement_kw && <p className="text-sm text-slate-600 mt-1">Est. System: {r.estimated_solar_requirement_kw} kW</p>}
                          </div>
                          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Calculator */}
          <TabsContent value="calculator">
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Solar Savings Calculator</h3>
                      <p className="text-sm text-slate-500">Estimate your potential savings</p>
                    </div>
                    <Link href="/solar-calculator"><Button className="bg-amber-500 hover:bg-amber-600 text-white"><Calculator className="h-4 w-4 mr-2" /> Open Calculator</Button></Link>
                  </div>
                </CardContent>
              </Card>
              {savedCalcs.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Saved Calculations</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedCalcs.map(c => (
                        <div key={c.id} className="rounded-lg border p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{c.name || 'Calculation'}</p>
                            <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="secondary">Saved</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Service Requests */}
          <TabsContent value="services">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>New Service Request</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Service Type</Label>
                    <Select value={newServiceType} onValueChange={setNewServiceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} placeholder="Describe your service requirement..." />
                  </div>
                  <Button onClick={createServiceRequest} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Submit Request
                  </Button>
                </CardContent>
              </Card>
              {serviceRequests.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>My Service Requests</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {serviceRequests.map(sr => (
                        <div key={sr.id} className="rounded-lg border p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{sr.service_type || sr.type}</p>
                            <p className="text-xs text-slate-500">{sr.description}</p>
                          </div>
                          <Badge variant={sr.status === 'RESOLVED' ? 'default' : 'secondary'}>{sr.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500">No appointments scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(a => (
                      <div key={a.id} className="rounded-lg border p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 capitalize">{a.appointment_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-500">{new Date(a.scheduled_date).toLocaleDateString()} {a.scheduled_time || ''}</p>
                          {a.location && <p className="text-xs text-slate-500">{a.location}</p>}
                        </div>
                        <Badge variant={a.status === 'completed' ? 'default' : 'secondary'}>{a.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8"><Bell className="mx-auto h-12 w-12 text-slate-300 mb-3" /><p className="text-slate-500">No notifications.</p></div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <div key={n.id} className={`rounded-lg border p-3 ${!n.read ? 'bg-amber-50 border-amber-200' : ''}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          {!n.read && <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
                        </div>
                        {n.message && <p className="text-xs text-slate-600 mt-1">{n.message}</p>}
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Profile & Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={profileEdit.full_name} onChange={e => setProfileEdit({...profileEdit, full_name: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profileEdit.phone} onChange={e => setProfileEdit({...profileEdit, phone: e.target.value})} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea value={profileEdit.address} onChange={e => setProfileEdit({...profileEdit, address: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ''} disabled className="bg-slate-50" />
                </div>
                <Button onClick={updateProfile} className="bg-amber-500 hover:bg-amber-600 text-white">Update Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
