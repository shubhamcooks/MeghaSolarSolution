'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Calendar, MapPin, Building2, Download, Inbox, CheckCircle2, Clock, ArrowRight, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, type Tender, type TenderUpdate, type TenderDocument } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  published: { label: 'Published', variant: 'secondary' },
  open: { label: 'Open', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
  awarded: { label: 'Awarded', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
};

export default function GovernmentTendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [updates, setUpdates] = useState<Record<string, TenderUpdate[]>>({});
  const [documents, setDocuments] = useState<Record<string, TenderDocument[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tenders').select('*').order('created_at', { ascending: false });
      const allTenders = (data || []) as Tender[];
      const visibleTenders = allTenders.filter(t => t.is_published !== false && t.status !== 'draft' && t.status !== 'archived');
      setTenders(visibleTenders);

      const nextUpdates: Record<string, TenderUpdate[]> = {};
      const nextDocuments: Record<string, TenderDocument[]> = {};
      for (const t of visibleTenders) {
        const { data: upData } = await supabase.from('tender_updates').select('*').eq('tender_id', t.id).eq('is_public', true).order('created_at', { ascending: false });
        if (upData) nextUpdates[t.id] = upData as TenderUpdate[];
        const { data: docData } = await supabase.from('tender_documents').select('*').eq('tender_id', t.id).eq('is_public', true);
        if (docData) nextDocuments[t.id] = docData as TenderDocument[];
      }
      setUpdates(nextUpdates);
      setDocuments(nextDocuments);
      setLoading(false);
    })();
  }, []);

  if (selectedTender) {
    const t = selectedTender;
    const tUpdates = updates[t.id] || [];
    const tDocs = documents[t.id] || [];
    const isCompleted = t.status === 'completed';

    return (
      <div className="min-h-screen bg-slate-50">
        <section className="bg-gradient-to-b from-amber-50 to-white py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTender(null)} className="mb-4">
              <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back to Tenders
            </Button>
            <div className="flex items-center gap-2 mb-2">
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Completed Project
                </Badge>
              )}
              <Badge variant={statusConfig[t.status]?.variant || 'outline'}>
                {statusConfig[t.status]?.label || t.status}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t.title}</h1>
            {t.reference_number && <p className="text-sm text-slate-500 mb-4">Reference: {t.reference_number}</p>}
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                  {t.organization && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> {t.organization}</div>}
                  {t.department && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" /> {t.department}</div>}
                  {t.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {t.location}</div>}
                  {t.published_date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Published: {new Date(t.published_date).toLocaleDateString()}</div>}
                  {t.submission_deadline && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> Deadline: {new Date(t.submission_deadline).toLocaleDateString()}</div>}
                  {t.awarded_date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Awarded: {new Date(t.awarded_date).toLocaleDateString()}</div>}
                  {t.completion_date && <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Completed: {new Date(t.completion_date).toLocaleDateString()}</div>}
                </div>
                {t.project_description && <p className="text-slate-600 leading-relaxed mb-4">{t.project_description}</p>}
                {isCompleted && t.completion_date && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
                    <p className="text-sm font-semibold text-green-800 mb-1">Project Completed</p>
                    <p className="text-sm text-green-700">Completion Date: {new Date(t.completion_date).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {tDocs.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Documents</h3>
                  <div className="space-y-2">
                    {tDocs.map(doc => (
                      <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50">
                        <Download className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-slate-700">{doc.file_name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tUpdates.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Project Updates</h3>
                  <div className="space-y-4">
                    {tUpdates.map(up => (
                      <div key={up.id} className="border-l-2 border-amber-300 pl-4">
                        <p className="font-medium text-slate-900 text-sm">{up.update_title}</p>
                        <p className="text-sm text-slate-600 mt-1">{up.update_text}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(up.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Government Tenders & Projects</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Information about government tender and project work opportunities.</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-lg bg-slate-100 animate-pulse" />)}
            </div>
          ) : tenders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Inbox className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Active Tenders</h2>
                <p className="text-slate-500">No active tender information is currently available.</p>
                <p className="text-sm text-slate-400 mt-2">Please check back later or contact us for updates.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tenders.map((tender) => (
                <Card key={tender.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedTender(tender)}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {tender.status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Completed Project
                            </Badge>
                          )}
                          <Badge variant={statusConfig[tender.status]?.variant || 'outline'}>
                            {statusConfig[tender.status]?.label || tender.status}
                          </Badge>
                          {tender.reference_number && <span className="text-xs text-slate-500">Ref: {tender.reference_number}</span>}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">{tender.title}</h3>
                        {tender.project_description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{tender.project_description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      {tender.organization && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> {tender.organization}</div>}
                      {tender.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {tender.location}</div>}
                      {tender.published_date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Published: {new Date(tender.published_date).toLocaleDateString()}</div>}
                      {tender.completion_date && <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" /> Completed: {new Date(tender.completion_date).toLocaleDateString()}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
