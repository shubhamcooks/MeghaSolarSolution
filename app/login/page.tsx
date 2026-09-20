'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Mail, Lock, Loader2, LogIn, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth/context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    if (rememberMe) localStorage.setItem('rememberEmail', email);
    else localStorage.removeItem('rememberEmail');
    const { error, role } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: 'Invalid email or password. Please try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Welcome back!' });
    if (role === 'admin') router.push('/admin');
    else if (role === 'staff') router.push('/dashboard/staff');
    else router.push('/dashboard/customer');
  };

  useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-amber-50 to-slate-50 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <Sun className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Customer Login</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Sign in to track your application and manage services.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: undefined}); }} placeholder="your@email.com" className="pl-10" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: undefined}); }} placeholder="Your password" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
                <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Remember me</Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
            </Button>
          </form>
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-amber-600 hover:text-amber-700">Create account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
