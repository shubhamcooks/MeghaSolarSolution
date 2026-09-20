'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast({ title: 'Please fill in name and message', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('contact_enquiries').insert(form);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Message sent!', description: 'We will get back to you soon.' });
    setForm({ name: '', phone: '', email: '', location: '', message: '' });
  };

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Have questions about solar installation or the PM Surya Ghar scheme? Get in touch with us.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact info */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Get In Touch</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100"><Phone className="h-5 w-5 text-amber-600" /></div>
                    <div>
                      <p className="font-medium text-slate-900">Phone</p>
                      <p className="text-sm text-slate-500">03644051727</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"><Mail className="h-5 w-5 text-green-600" /></div>
                    <div>
                      <p className="font-medium text-slate-900">Email</p>
                      <p className="text-sm text-slate-500">meghasolarsolution@gmail.com</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100"><MapPin className="h-5 w-5 text-sky-600" /></div>
                    <div>
                      <p className="font-medium text-slate-900">Service Areas</p>
                      <p className="text-sm text-slate-500">Nongstoin, Myrâng, Dhirang, Chyllang, Lumingshai</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"><MessageCircle className="h-5 w-5 text-green-600" /></div>
                    <div>
                      <p className="font-medium text-slate-900">WhatsApp</p>
                      <p className="text-sm text-slate-500">03644051727</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="c-name">Name *</Label>
                      <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="c-phone">Phone</Label>
                      <Input id="c-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
                    </div>
                    <div>
                      <Label htmlFor="c-email">Email</Label>
                      <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" />
                    </div>
                    <div>
                      <Label htmlFor="c-location">Location</Label>
                      <Input id="c-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Your village/town" />
                    </div>
                    <div>
                      <Label htmlFor="c-message">Message *</Label>
                      <Textarea id="c-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" rows={4} />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
