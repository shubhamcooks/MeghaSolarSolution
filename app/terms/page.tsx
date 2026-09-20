'use client';

import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
            <FileText className="h-4 w-4" />
            Legal
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Terms & Conditions</h1>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">1. Services</h2>
              <p>Megha Solar Solutions provides solar installation, maintenance, repair services, and assistance with the solar installation process. We do not approve government applications, determine scheme eligibility, or disburse government subsidies. These are handled by relevant government authorities and DISCOMs.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">2. Applications</h2>
              <p>Submitting an application through our website does not constitute government approval or guarantee subsidy. Applications are reviewed by our team, and we assist with the installation process. Government scheme eligibility and approval are determined solely by the relevant authorities.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">3. No Government Affiliation</h2>
              <p>Megha Solar Solutions is a private company. We are not part of any government body, DISCOM, or the PM Surya Ghar scheme administration. We do not claim government affiliation, endorsement, or authorization.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">4. Accuracy of Information</h2>
              <p>We strive to provide accurate information about government schemes. However, scheme rules, eligibility criteria, and subsidy amounts may change. You are responsible for verifying information through official government sources.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">5. User Accounts</h2>
              <p>You are responsible for maintaining the security of your account credentials. Do not share your login details with others. You are responsible for all activities under your account.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">6. Limitation of Liability</h2>
              <p>We are not liable for any losses arising from government scheme changes, approval delays, or subsidy decisions. Our liability is limited to the services we directly provide.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">7. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of our services constitutes acceptance of the updated terms.</p>
            </div>
            <p className="text-sm text-slate-400 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
