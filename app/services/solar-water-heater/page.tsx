'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sun, 
  Thermometer, 
  Droplets, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Flame,
  Home,
  Users,
  MapPin,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PROPERTY_TYPES = ['Residential House', 'Apartment', 'Commercial Building', 'Hostel/Hotel', 'Hospital', 'Industrial'];

export default function SolarWaterHeaterPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    property_type: '',
    num_people: '',
    hot_water_requirement: '',
    preferred_location: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('service_enquiries').insert({
        service_type: 'solar_water_heater',
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address,
        property_type: form.property_type || null,
        num_people: form.num_people ? parseInt(form.num_people) : null,
        hot_water_requirement: form.hot_water_requirement || null,
        preferred_location: form.preferred_location || null,
        message: form.message || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Enquiry submitted successfully! We will contact you soon.' });
    } catch (err) {
      toast({ title: 'Failed to submit enquiry. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Enquiry Submitted!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your interest in our Solar Water Heater service. Our team will review your enquiry and contact you within 2-3 business days.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/"><Button>Back to Home</Button></Link>
            <Link href="/services"><Button variant="outline">View All Services</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-600 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <Sun className="absolute top-10 right-10 h-64 w-64" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-white mb-4 hover:bg-white/30">Solar Water Heater Service</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Solar Water Heater Installation & Services</h1>
            <p className="text-lg text-orange-50">
              Megha Solar Solutions provides solar water heater consultation, supply coordination, installation, maintenance and repair/service support across Meghalaya.
            </p>
          </div>
        </div>
      </section>

      {/* What is a Solar Water Heater */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">What is a Solar Water Heater?</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                A solar water heater uses energy from the sun to heat water for domestic, commercial or industrial use. It consists of solar collectors that absorb solar radiation and a storage tank that stores the heated water for use throughout the day.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Solar water heaters are one of the most cost-effective renewable energy applications, reducing electricity or gas consumption for water heating significantly.
              </p>
            </div>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-8">
                <Thermometer className="h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">How It Works</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex gap-3"><span className="font-bold text-orange-600">1.</span> Solar collectors absorb sunlight and convert it to heat</li>
                  <li className="flex gap-3"><span className="font-bold text-orange-600">2.</span> A heat transfer fluid carries the heat to the storage tank</li>
                  <li className="flex gap-3"><span className="font-bold text-orange-600">3.</span> Cold water is heated and stored in an insulated tank</li>
                  <li className="flex gap-3"><span className="font-bold text-orange-600">4.</span> Hot water is available on demand, even at night</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Types */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Types of Solar Water Heaters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Droplets className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>ETC System</CardTitle>
                <CardDescription>Evacuated Tube Collector</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">Uses glass tubes with vacuum insulation for high efficiency. Best for colder climates and higher temperature requirements.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Flame className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>FPC System</CardTitle>
                <CardDescription>Flat Plate Collector</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">Uses a flat absorber plate with selective coating. Durable and suitable for most residential applications in moderate climates.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Sun className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle>Active vs Passive</CardTitle>
                <CardDescription>System circulation type</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">Active systems use pumps for circulation, offering more flexibility. Passive systems rely on natural convection, requiring no electricity.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Reduced Energy Bills', desc: 'Lower electricity or gas consumption for water heating' },
              { icon: Sun, title: 'Eco-Friendly', desc: 'Uses clean, renewable solar energy with no emissions' },
              { icon: Wrench, title: 'Low Maintenance', desc: 'Durable systems with minimal upkeep requirements' },
              { icon: Thermometer, title: 'Consistent Hot Water', desc: 'Reliable hot water supply throughout the day' },
            ].map((b) => (
              <Card key={b.title} className="text-center">
                <CardContent className="pt-6">
                  <b.icon className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Installation & Maintenance */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Installation & Maintenance</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader><CardTitle>Installation Requirements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5 text-slate-600">
                  <li>Suitable rooftop or open area with good sunlight exposure</li>
                  <li>Adequate structural support for the collector and tank</li>
                  <li>Access to cold water supply</li>
                  <li>Proper plumbing connections to bathrooms and kitchens</li>
                  <li>Sufficient space for the storage tank (100-500 liters depending on usage)</li>
                  <li>South-facing orientation preferred for optimal efficiency</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Maintenance</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5 text-slate-600">
                  <li>Annual inspection of collectors for scaling or corrosion</li>
                  <li>Check and clean glass tubes/plates every 6-12 months</li>
                  <li>Inspect insulation and piping for leaks</li>
                  <li>Check the sacrificial anode in the tank annually</li>
                  <li>Flush the system periodically to remove sediment</li>
                  <li>Professional servicing recommended once a year</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquiry" className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Request Installation</h2>
            <p className="text-slate-600">Fill out the form below and our team will get in touch with you.</p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea id="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={form.property_type} onValueChange={v => setForm({...form, property_type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="num_people">Number of People Using Hot Water</Label>
                    <Input id="num_people" type="number" min="1" value={form.num_people} onChange={e => setForm({...form, num_people: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hot_water_requirement">Approximate Hot Water Requirement (liters/day)</Label>
                  <Input id="hot_water_requirement" type="number" value={form.hot_water_requirement} onChange={e => setForm({...form, hot_water_requirement: e.target.value})} placeholder="e.g., 200" />
                </div>
                <div>
                  <Label htmlFor="preferred_location">Preferred Installation Location</Label>
                  <Input id="preferred_location" value={form.preferred_location} onChange={e => setForm({...form, preferred_location: e.target.value})} placeholder="e.g., Rooftop, Ground level" />
                </div>
                <div>
                  <Label htmlFor="message">Additional Message</Label>
                  <Textarea id="message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Any specific requirements or questions..." />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <>Submit Enquiry <ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Note: Solar water heaters are not covered under the PM Surya Ghar scheme unless officially verified. Please consult our team for current government programs.
          </p>
        </div>
      </section>
    </div>
  );
}
