'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, MapPin, Building2, Download, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, type Tender } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tenders').select('*').order('published_date', { ascending: false });
      setTenders((data || []) as Tender[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Government Tenders</h1>
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
                <Card key={tender.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={tender.status === 'open' || tender.status === 'published' ? 'default' : tender.status === 'completed' ? 'secondary' : 'outline'}>
                            {tender.status === 'open' ? 'Active' : tender.status === 'completed' ? 'Completed' : tender.status === 'awarded' ? 'Awarded' : tender.status === 'in_progress' ? 'In Progress' : tender.status === 'closed' ? 'Closed' : tender.status}
                          </Badge>
                          {tender.tender_number && <span className="text-xs text-slate-500">Tender #: {tender.tender_number}</span>}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">{tender.title}</h3>
                      </div>
                      {tender.document_url && (
                        <a href={tender.document_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Document</Button>
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                      {tender.department && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /> {tender.department}</div>}
                      {tender.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {tender.location}</div>}
                      {tender.published_date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Published: {new Date(tender.published_date).toLocaleDateString()}</div>}
                      {tender.closing_date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Closes: {new Date(tender.closing_date).toLocaleDateString()}</div>}
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
