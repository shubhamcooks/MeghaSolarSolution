'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle2, ArrowRight, Phone, Map, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type District } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';

const highlightedLocations = [
  { name: 'Nongstoin', description: 'Headquarters area for Megha Solar Solutions operations in West Khasi Hills' },
  { name: 'Myrâng', description: 'Serving the Myrâng area and surrounding communities' },
  { name: 'Dhirang', description: 'Solar installation and service support in Dhirang' },
  { name: 'Chyllang', description: 'Rooftop solar and maintenance services available' },
  { name: 'Lumingshai', description: 'Service area covering Lumingshai and nearby villages' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active_service_area: { label: 'Active Service Area', color: 'text-green-700', bg: 'bg-green-100' },
  service_available_on_request: { label: 'Service Available on Request', color: 'text-amber-700', bg: 'bg-amber-100' },
  planned_coverage: { label: 'Planned Coverage', color: 'text-slate-600', bg: 'bg-slate-100' },
};

export default function ServiceAreasPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('districts').select('*').eq('is_active', true).order('display_order');
      setDistricts((data || []) as District[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
            <Map className="h-4 w-4" />
            Service Coverage
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">Serving Communities Across Meghalaya</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            We provide solar installation and related services across Meghalaya. Coverage varies by district — check the status below.
          </p>
        </div>
      </section>

      {/* Highlighted Locations */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Our Highlighted Service Locations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlightedLocations.map((loc) => (
              <Card key={loc.name} className="border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{loc.name}</h3>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{loc.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Districts */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">All Meghalaya Districts</h2>
          <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
            Coverage status is managed by our admin team. Not all districts have active service availability.
          </p>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-lg bg-white animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {districts.map((d) => {
                const config = statusConfig[d.coverage_status] || statusConfig.planned_coverage;
                return (
                  <Card key={d.id} className="hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-slate-900">{d.name}</h3>
                        <Badge className={`${config.bg} ${config.color} hover:opacity-80`}>{config.label}</Badge>
                      </div>
                      {d.region && <p className="text-xs text-slate-500 mb-2">Region: {d.region}</p>}
                      {d.available_services && d.available_services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {d.available_services.map((s, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Link href="/contact">
                          <Button variant="outline" size="sm" className="text-slate-700">
                            <Phone className="mr-1.5 h-3.5 w-3.5" /> Enquire
                          </Button>
                        </Link>
                        <Link href="/apply">
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                            Request Assessment
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 text-left">
              District coverage information is managed by our admin team and may change. Please contact us to confirm service availability in your area.
            </p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Outside These Areas?</h2>
          <p className="text-slate-600 mb-6">Contact us and we will try to help or refer you to someone who can.</p>
          <Link href="/contact">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Contact Us <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
