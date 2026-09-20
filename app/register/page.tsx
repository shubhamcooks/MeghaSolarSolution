'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Mail, Lock, User, Phone, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.fullName) return;
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.phone, 'customer');
    setLoading(false);
    if (error) {
      toast({ title: 'Registration failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Account created!', description: 'Please sign in with your credentials.' });
    router.push('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
            <Sun className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Register to apply for solar installation and track applications.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="r-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="r-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="r-phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="r-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="r-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="r-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="r-pass">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="r-pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="pl-10" required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : <><UserPlus className="mr-2 h-4 w-4" /> Register</>}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
