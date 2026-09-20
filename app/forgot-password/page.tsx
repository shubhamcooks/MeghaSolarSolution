'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sun, Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch {
      // Do not reveal whether account exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-amber-50 to-slate-50 px-4 py-16">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h1>
            <p className="text-slate-600 text-sm mb-6">
              If an account exists for this email address, you will receive a password reset link shortly. The link will expire after a limited time.
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-6">
              <p className="text-xs text-amber-800">
                For security reasons, we do not reveal whether an account exists for the entered email. If you do not receive an email, please check your spam folder or contact support.
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-amber-50 to-slate-50 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Enter your registered email to receive a reset link.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="pl-10" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <>Send Reset Link</>}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
