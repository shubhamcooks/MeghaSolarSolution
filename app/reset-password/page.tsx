'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) errs.password = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(password)) errs.password = 'Include at least one number';
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast({ title: 'Password reset successfully!' });
    } catch {
      toast({ title: 'Failed to reset password. The link may have expired.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-amber-50 to-slate-50 px-4 py-16">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Password Updated</h1>
            <p className="text-slate-600 text-sm mb-6">Your password has been reset successfully. Please log in with your new password.</p>
            <Button onClick={() => router.push('/login')} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Go to Login
            </Button>
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
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Enter your new password below.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setErrors({...errors, password: undefined}); }} placeholder="Min 8 characters" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              <div className="mt-2 rounded-lg bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Password must: be 8+ characters, include an uppercase letter and a number.</p>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors({...errors, confirm: undefined}); }} placeholder="Re-enter password" className="pl-10" />
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : <>Reset Password</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
