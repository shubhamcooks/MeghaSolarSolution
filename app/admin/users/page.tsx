'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Loader2, ArrowLeft, UserCog, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { supabase, type Profile } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin') || !profile) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles((data || []) as Profile[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setProfiles(profs => profs.map(p => p.id === id ? { ...p, role: role as Profile['role'] } : p));
    toast({ title: 'Role updated' });
  };

  const toggleSuspend = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_suspended: !current }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setProfiles(profs => profs.map(p => p.id === id ? { ...p, is_suspended: !current } : p));
    toast({ title: !current ? 'Suspended' : 'Activated' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  const filtered = profiles.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage user accounts and roles.</p>
          </div>
          <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin</Button></Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({filtered.length})</span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead><TableHead>Registered</TableHead><TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell className="text-xs">{p.email || '-'}</TableCell>
                      <TableCell className="text-xs">{p.phone || '-'}</TableCell>
                      <TableCell>
                        <Select defaultValue={p.role} onValueChange={(v) => updateRole(p.id, v)}>
                          <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{p.last_login_at ? new Date(p.last_login_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell><Badge variant={p.is_suspended ? 'destructive' : 'default'}>{p.is_suspended ? 'Suspended' : 'Active'}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleSuspend(p.id, p.is_suspended)}>
                          {p.is_suspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
