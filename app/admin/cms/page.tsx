'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Loader2, ArrowLeft, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/context';
import { supabase, type CmsContent } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminCmsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [contents, setContents] = useState<CmsContent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newContent, setNewContent] = useState({ page_key: '', section_key: '', content_key: '', content_value: '' });

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== 'admin'))) router.push('/login');
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin') || !profile) return;
    (async () => {
      const { data } = await supabase.from('cms_content').select('*').order('page_key');
      setContents((data || []) as CmsContent[]);
      setDataLoading(false);
    })();
  }, [user, profile]);

  const addContent = async () => {
    if (!newContent.page_key || !newContent.section_key || !newContent.content_key) return;
    const { error } = await supabase.from('cms_content').insert({
      ...newContent, is_published: true,
    });
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Content added' });
    setNewContent({ page_key: '', section_key: '', content_key: '', content_value: '' });
    const { data } = await supabase.from('cms_content').select('*').order('page_key');
    setContents((data || []) as CmsContent[]);
  };

  const updateContent = async (id: string, value: string) => {
    const { error } = await supabase.from('cms_content').update({ content_value: value }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Content updated' });
  };

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('cms_content').update({ is_published: !current }).eq('id', id);
    if (error) { toast({ title: 'Failed', variant: 'destructive' }); return; }
    setContents(contents.map(c => c.id === id ? { ...c, is_published: !current } : c));
    toast({ title: !current ? 'Published' : 'Unpublished' });
  };

  if (loading || dataLoading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage public website content without editing code.</p>
          </div>
          <Link href="/admin"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin</Button></Link>
        </div>

        <Card className="mb-4">
          <CardHeader><CardTitle>Add Content</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Page Key</Label>
                <Input placeholder="e.g., homepage" value={newContent.page_key} onChange={e => setNewContent({ ...newContent, page_key: e.target.value })} />
              </div>
              <div>
                <Label>Section Key</Label>
                <Input placeholder="e.g., hero" value={newContent.section_key} onChange={e => setNewContent({ ...newContent, section_key: e.target.value })} />
              </div>
              <div>
                <Label>Content Key</Label>
                <Input placeholder="e.g., title" value={newContent.content_key} onChange={e => setNewContent({ ...newContent, content_key: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Content Value</Label>
              <Textarea placeholder="Enter content text..." value={newContent.content_value} onChange={e => setNewContent({ ...newContent, content_value: e.target.value })} />
            </div>
            <Button onClick={addContent} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="mr-1.5 h-4 w-4" /> Add Content</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Existing Content ({contents.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contents.map(c => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-mono text-amber-600">{c.page_key} / {c.section_key} / {c.content_key}</p>
                    <Button variant="outline" size="sm" onClick={() => togglePublish(c.id, c.is_published)}>
                      {c.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                  <Textarea defaultValue={c.content_value || ''} onBlur={e => updateContent(c.id, e.target.value)} rows={3} />
                </div>
              ))}
              {contents.length === 0 && <p className="text-center text-slate-500 py-4">No CMS content yet. Add content above to manage your website text.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
