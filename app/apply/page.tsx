'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Zap, Sun, FileText, CheckCircle2, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { num: 1, title: 'Personal Details', icon: User },
  { num: 2, title: 'Location', icon: MapPin },
  { num: 3, title: 'Electricity Information', icon: Zap },
  { num: 4, title: 'Solar Requirements', icon: Sun },
  { num: 5, title: 'Documents', icon: FileText },
  { num: 6, title: 'Confirmation', icon: CheckCircle2 },
];

interface FormData {
  full_name: string;
  mobile_number: string;
  email: string;
  address: string;
  state: string;
  district: string;
  block: string;
  village_town: string;
  pin_code: string;
  installation_address: string;
  map_location: string;
  has_electricity: boolean;
  consumer_number: string;
  electricity_provider: string;
  monthly_usage: string;
  has_existing_solar: boolean;
  roof_type: string;
  interested_rooftop_solar: boolean;
  estimated_system_size: string;
  primary_purpose: string;
  property_type: string;
  request_type: string;
  notes: string;
}

const initialData: FormData = {
  full_name: '', mobile_number: '', email: '', address: '',
  state: 'Meghalaya', district: '', block: '', village_town: '', pin_code: '', installation_address: '', map_location: '',
  has_electricity: false, consumer_number: '', electricity_provider: '', monthly_usage: '', has_existing_solar: false, roof_type: '',
  interested_rooftop_solar: true, estimated_system_size: '', primary_purpose: '', property_type: '', request_type: 'new_installation',
  notes: '',
};

export default function ApplyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const update = (field: keyof FormData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    if (step === 1) return !!data.full_name && !!data.mobile_number;
    if (step === 2) return !!data.district && !!data.village_town;
    return true;
  };

  const handleSubmit = async () => {
    if (!agreed) {
      toast({ title: 'Please confirm the declaration', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const appId = `MSS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const newRowId = crypto.randomUUID();

    const { data: authData } = await supabase.auth.getSession();
    const userId = authData.session?.user?.id || null;

    const { error } = await supabase.from('applications').insert({
      id: newRowId,
      application_id: appId,
      user_id: userId,
      status: 'NEW',
      ...data,
    });

    if (error) {
      toast({ title: 'Submission failed', description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const { error: historyError } = await supabase.from('application_status_history').insert({
      application_id: newRowId,
      status: 'NEW',
      comment: 'Application submitted',
    });
    if (historyError) {
      // Non-fatal: the application itself was saved successfully.
      console.error('Failed to record initial status history:', historyError.message);
    }

    setSubmitted(appId);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4 py-16">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
            <p className="text-slate-600 mb-4">Your application has been received. Save your Application ID to track your status.</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-6">
              <p className="text-xs text-amber-700 mb-1">Your Application ID</p>
              <p className="text-xl font-bold text-amber-900 tracking-wider">{submitted}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button onClick={() => router.push(`/track?id=${submitted}`)} className="bg-amber-500 hover:bg-amber-600 text-white">
                Track Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Apply for Solar Installation Assistance</h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Complete the form below to start your solar installation request.</p>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center flex-1 min-w-0">
                  <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-amber-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${isActive ? 'border-amber-500 bg-amber-50' : isDone ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white'}`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className="text-[10px] font-medium hidden sm:block">{s.title}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Personal Details</h2>
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" value={data.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <Label htmlFor="mobile_number">Mobile Number *</Label>
                    <Input id="mobile_number" type="tel" value={data.mobile_number} onChange={(e) => update('mobile_number', e.target.value)} placeholder="10-digit mobile number" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="Your current address" />
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Location</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={data.state} onChange={(e) => update('state', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Input id="district" value={data.district} onChange={(e) => update('district', e.target.value)} placeholder="e.g., West Khasi Hills" />
                    </div>
                    <div>
                      <Label htmlFor="block">Block</Label>
                      <Input id="block" value={data.block} onChange={(e) => update('block', e.target.value)} placeholder="Block name" />
                    </div>
                    <div>
                      <Label htmlFor="village_town">Village/Town *</Label>
                      <Input id="village_town" value={data.village_town} onChange={(e) => update('village_town', e.target.value)} placeholder="Village or town name" />
                    </div>
                    <div>
                      <Label htmlFor="pin_code">PIN Code</Label>
                      <Input id="pin_code" value={data.pin_code} onChange={(e) => update('pin_code', e.target.value)} placeholder="6-digit PIN" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="installation_address">Installation Address</Label>
                    <Textarea id="installation_address" value={data.installation_address} onChange={(e) => update('installation_address', e.target.value)} placeholder="Where solar will be installed (if different from above)" />
                  </div>
                  <div>
                    <Label htmlFor="map_location">Map Location (optional)</Label>
                    <Input id="map_location" value={data.map_location} onChange={(e) => update('map_location', e.target.value)} placeholder="Google Maps link or landmark" />
                  </div>
                </div>
              )}

              {/* Step 3: Electricity */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Electricity Information</h2>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="has_electricity" checked={data.has_electricity} onCheckedChange={(v) => update('has_electricity', v === true)} />
                    <Label htmlFor="has_electricity">Electricity connection available?</Label>
                  </div>
                  {data.has_electricity && (
                    <>
                      <div>
                        <Label htmlFor="consumer_number">Consumer Number</Label>
                        <Input id="consumer_number" value={data.consumer_number} onChange={(e) => update('consumer_number', e.target.value)} placeholder="Your electricity consumer number" />
                      </div>
                      <div>
                        <Label htmlFor="electricity_provider">Electricity Provider / DISCOM</Label>
                        <Input id="electricity_provider" value={data.electricity_provider} onChange={(e) => update('electricity_provider', e.target.value)} placeholder="e.g., MEPDCL" />
                      </div>
                      <div>
                        <Label htmlFor="monthly_usage">Approximate Monthly Usage</Label>
                        <Select value={data.monthly_usage} onValueChange={(v) => update('monthly_usage', v)}>
                          <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-100">0-100 units</SelectItem>
                            <SelectItem value="100-200">100-200 units</SelectItem>
                            <SelectItem value="200-300">200-300 units</SelectItem>
                            <SelectItem value="300+">300+ units</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="has_existing_solar" checked={data.has_existing_solar} onCheckedChange={(v) => update('has_existing_solar', v === true)} />
                    <Label htmlFor="has_existing_solar">Existing rooftop solar?</Label>
                  </div>
                  <div>
                    <Label htmlFor="roof_type">Roof Type</Label>
                    <Select value={data.roof_type} onValueChange={(v) => update('roof_type', v)}>
                      <SelectTrigger><SelectValue placeholder="Select roof type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concrete">Concrete/RCC</SelectItem>
                        <SelectItem value="tin">Tin/Metal</SelectItem>
                        <SelectItem value="tiled">Tiled</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 4: Solar Requirements */}
              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Solar Requirements</h2>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="interested_rooftop_solar" checked={data.interested_rooftop_solar} onCheckedChange={(v) => update('interested_rooftop_solar', v === true)} />
                    <Label htmlFor="interested_rooftop_solar">Interested in rooftop solar?</Label>
                  </div>
                  <div>
                    <Label htmlFor="estimated_system_size">Estimated System Size</Label>
                    <Select value={data.estimated_system_size} onValueChange={(v) => update('estimated_system_size', v)}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2kW">1-2 kW</SelectItem>
                        <SelectItem value="2-3kW">2-3 kW</SelectItem>
                        <SelectItem value="3-5kW">3-5 kW</SelectItem>
                        <SelectItem value="5-10kW">5-10 kW</SelectItem>
                        <SelectItem value="10kW+">10 kW+</SelectItem>
                        <SelectItem value="not_sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primary_purpose">Primary Purpose</Label>
                    <Select value={data.primary_purpose} onValueChange={(v) => update('primary_purpose', v)}>
                      <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reduce_bill">Reduce electricity bill</SelectItem>
                        <SelectItem value="backup">Power backup</SelectItem>
                        <SelectItem value="environment">Environmental concern</SelectItem>
                        <SelectItem value="scheme">PM Surya Ghar scheme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Property Type</Label>
                    <RadioGroup value={data.property_type} onValueChange={(v) => update('property_type', v)}>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="residential" id="r-res" /><Label htmlFor="r-res">Residential</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="commercial" id="r-com" /><Label htmlFor="r-com">Commercial</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="community" id="r-cmu" /><Label htmlFor="r-cmu">Community/Institution</Label></div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Request Type</Label>
                    <RadioGroup value={data.request_type} onValueChange={(v) => update('request_type', v)}>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="new_installation" id="rt-new" /><Label htmlFor="rt-new">New Installation</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="service" id="rt-svc" /><Label htmlFor="rt-svc">Service Request</Label></div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 5: Documents */}
              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Documents</h2>
                  <p className="text-sm text-slate-600 mb-4">Upload any documents that may be required. Not all documents are mandatory at this stage — we will guide you on what is needed after reviewing your application.</p>
                  <div className="space-y-3">
                    {['Identity proof (Aadhaar/PAN)', 'Electricity bill', 'Property proof', 'Other documents'].map((doc) => (
                      <div key={doc} className="rounded-lg border border-dashed border-slate-300 p-4">
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">{doc}</Label>
                        <Input type="file" className="text-sm" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Max file size: 5MB. Accepted formats: PDF, JPG, PNG.</p>
                </div>
              )}

              {/* Step 6: Confirmation */}
              {step === 6 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Confirmation</h2>
                  <div className="rounded-lg bg-slate-50 border p-4 space-y-2">
                    <p className="text-sm text-slate-700"><strong>Name:</strong> {data.full_name}</p>
                    <p className="text-sm text-slate-700"><strong>Mobile:</strong> {data.mobile_number}</p>
                    <p className="text-sm text-slate-700"><strong>Location:</strong> {data.village_town}, {data.district}, {data.state}</p>
                    <p className="text-sm text-slate-700"><strong>Property Type:</strong> {data.property_type || 'Not specified'}</p>
                    <p className="text-sm text-slate-700"><strong>Request Type:</strong> {data.request_type === 'new_installation' ? 'New Installation' : 'Service Request'}</p>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                      By submitting this request, I understand that submission through Megha Solar Solutions does not itself constitute government approval or guarantee subsidy.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
                    <Label htmlFor="agree" className="text-sm">I have read and understand the above declaration.</Label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || submitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {step < 6 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!validateStep()} className="bg-amber-500 hover:bg-amber-600 text-white">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting || !agreed} className="bg-green-600 hover:bg-green-700 text-white">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Disclaimer variant="compact" />
          </div>
        </div>
      </section>
    </div>
  );
}
