'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase, type FAQ } from '@/lib/supabase/client';
import Disclaimer from '@/components/shared/Disclaimer';
import { cn } from '@/lib/utils';

const fallbackFAQs: FAQ[] = [
  { id: '1', question: 'What is PM Surya Ghar?', answer: 'PM Surya Ghar: Muft Bijli Yojana is a Government of India scheme that encourages rooftop solar installation for households. Eligible households may receive financial assistance from the government.', category: 'pm-surya-ghar', sort_order: 1 },
  { id: '2', question: 'How does rooftop solar work?', answer: 'Solar panels on your roof capture sunlight and convert it into electricity. This powers your home during the day. Extra electricity can be sent to the grid for credits.', category: 'solar-basics', sort_order: 2 },
  { id: '3', question: 'Who can apply?', answer: 'Any household or property owner can submit a request. For PM Surya Ghar, eligibility is determined by the government and your DISCOM.', category: 'eligibility', sort_order: 3 },
  { id: '4', question: 'What does subsidy mean?', answer: 'A subsidy is financial help from the government that reduces installation cost. The amount depends on government rules and system size.', category: 'pm-surya-ghar', sort_order: 4 },
  { id: '5', question: 'How does the installation process work?', answer: 'The process involves: application, review, site assessment, documentation, installation, and inspection/commissioning.', category: 'process', sort_order: 5 },
  { id: '6', question: 'How long does installation take?', answer: 'Physical installation takes 1-3 days. The complete process including approvals may take several weeks.', category: 'process', sort_order: 6 },
  { id: '7', question: 'What documents may be required?', answer: 'Documents may include: identity proof, electricity bill, property proof, and income proof. We will guide you after reviewing your application.', category: 'documents', sort_order: 7 },
  { id: '8', question: 'Can Megha Solar Solutions help with the installation process?', answer: 'Yes. We provide installation, site assessment, documentation assistance, and maintenance. Government scheme eligibility and approval are handled by relevant authorities.', category: 'company', sort_order: 8 },
  { id: '9', question: 'What happens after installation?', answer: 'The system needs inspection and commissioning by relevant authorities. Once commissioned, your system starts generating electricity.', category: 'process', sort_order: 9 },
  { id: '10', question: 'What maintenance is required?', answer: 'Solar panels require minimal maintenance: periodic cleaning, annual inspection, and performance monitoring. We offer maintenance services.', category: 'maintenance', sort_order: 10 },
  { id: '11', question: 'How can I track my application?', answer: 'Use the Track Application page on our website. Enter your Application ID or mobile number to see current status.', category: 'process', sort_order: 11 },
  { id: '12', question: 'Which areas do you serve?', answer: 'We serve: Nongstoin, Myrâng, Dhirang, Chyllang, and Lumingshai in Meghalaya.', category: 'company', sort_order: 12 },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('faqs').select('*').order('sort_order');
      setFaqs(data && data.length > 0 ? data as FAQ[] : fallbackFAQs);
    })();
  }, []);

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">FAQ</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Find answers to common questions about solar installation and the PM Surya Ghar scheme.</p>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="pl-10" />
          </div>
        </div>
      </section>

      <section className="flex-1 py-8 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No questions match your search.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                      <ChevronDown className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform', openId === faq.id && 'rotate-180')} />
                    </button>
                    {openId === faq.id && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
