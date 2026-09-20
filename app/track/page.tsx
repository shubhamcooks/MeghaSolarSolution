'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, Circle, FileText, MapPin, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, type ApplicationStatus } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';

interface TrackedApplication {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  full_name: string;
  village_town: string | null;
  district: string | null;
  request_type: string | null;
  created_at: string;
}

interface TrackedHistoryItem {
  id: string;
  application_id: string;
  status: string;
  comment: string | null;
  created_at: string;
}

const statusOrder = [
  'NEW', 'UNDER_REVIEW', 'DOCUMENTS_REQUIRED', 'SITE_ASSESSMENT_PENDING',
  'SITE_ASSESSMENT_COMPLETED', 'APPLICATION_ASSISTANCE', 'INSTALLATION_SCHEDULED',
  'INSTALLATION_IN_PROGRESS', 'INSTALLATION_COMPLETED', 'INSPECTION_PENDING',
  'COMMISSIONING_PENDING', 'COMPLETED',
];

const statusLabels: Record<string, string> = {
  NEW: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  DOCUMENTS_REQUIRED: 'Documents Required',
  SITE_ASSESSMENT_PENDING: 'Site Assessment',
  SITE_ASSESSMENT_COMPLETED: 'Assessment Completed',
  APPLICATION_ASSISTANCE: 'Application Assistance',
  INSTALLATION_SCHEDULED: 'Installation Scheduled',
  INSTALLATION_IN_PROGRESS: 'Installation In Progress',
  INSTALLATION_COMPLETED: 'Installation Completed',
  INSPECTION_PENDING: 'Inspection Pending',
  COMMISSIONING_PENDING: 'Commissioning Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [application, setApplication] = useState<TrackedApplication | null>(null);
  const [history, setHistory] = useState<TrackedHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const search = async (id?: string) => {
    const searchValue = id || query;
    if (!searchValue.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    const { data: appData } = await supabase
      .rpc('track_application', { p_query: searchValue.trim() })
      .maybeSingle();
    const app = (appData as TrackedApplication | null) || null;

    if (app) {
      setApplication(app);
      const { data: histData } = await supabase.rpc('track_application_history', {
        p_application_id: app.id,
      });
      setHistory((histData || []) as TrackedHistoryItem[]);
    } else {
      setApplication(null);
      setHistory([]);
      setError('No application found. Please check your Application ID or mobile number.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setQuery(id);
      search(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentStatusIndex = application ? statusOrder.indexOf(application.status) : -1;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-12 lg:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Track Your Solar Application</h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Enter your Application ID or registered mobile number to check your status.</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="track-query" className="sr-only">Application ID or Mobile Number</Label>
                  <Input
                    id="track-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Application ID or mobile number"
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                  />
                </div>
                <Button onClick={() => search()} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Search className="mr-2 h-4 w-4" /> {loading ? 'Searching...' : 'Track'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {searched && !loading && error && (
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </section>
      )}

      {application && (
        <section className="py-8 flex-1">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Application summary */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Application ID</p>
                    <p className="text-lg font-bold text-amber-600 tracking-wider">{application.application_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${application.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : application.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {statusLabels[application.status] || application.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><User className="h-4 w-4 text-slate-400" /> {application.full_name}</div>
                  <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" /> {application.village_town}, {application.district}</div>
                  <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-4 w-4 text-slate-400" /> Submitted: {new Date(application.created_at).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2 text-slate-600"><FileText className="h-4 w-4 text-slate-400" /> {application.request_type === 'new_installation' ? 'New Installation' : 'Service Request'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Application Timeline</h2>
                <div className="space-y-1">
                  {statusOrder.map((status, index) => {
                    const isDone = index <= currentStatusIndex && application.status !== 'CANCELLED';
                    const isCurrent = index === currentStatusIndex;
                    const histItem = history.find((h) => h.status === status);
                    const Icon = isDone ? CheckCircle2 : isCurrent ? Clock : Circle;

                    return (
                      <div key={status} className="flex items-start gap-4 pb-6 relative">
                        {index < statusOrder.length - 1 && (
                          <div className={`absolute left-3 top-7 bottom-0 w-0.5 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} style={{ height: 'calc(100% - 1rem)' }} />
                        )}
                        <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isDone ? 'bg-green-100' : isCurrent ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          <Icon className={`h-4 w-4 ${isDone ? 'text-green-600' : isCurrent ? 'text-amber-600' : 'text-slate-300'}`} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className={`text-sm font-medium ${isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                            {statusLabels[status]}
                          </p>
                          {histItem && (
                            <div className="mt-1">
                              <p className="text-xs text-slate-500">{new Date(histItem.created_at).toLocaleString()}</p>
                              {histItem.comment && <p className="text-xs text-slate-600 mt-0.5">{histItem.comment}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {application.status === 'CANCELLED' && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">This application has been cancelled.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6">
              <Disclaimer variant="compact" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-6">
        <p className="text-slate-500 text-sm">Loading page...</p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}