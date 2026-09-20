'use client';

import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700">
            <Shield className="h-4 w-4" />
            Legal
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-3xl prose prose-slate">
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">1. Information We Collect</h2>
              <p>We collect information you provide when you submit an application, contact form, or create an account. This includes your name, mobile number, email, address, location details, electricity information, and any documents you upload.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
              <p>We use your information to process your solar installation application, communicate with you about your application, provide installation and maintenance services, and respond to your enquiries. We do not share your personal information with third parties without your consent, except as required by law.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">3. Data Security</h2>
              <p>We take appropriate security measures to protect your personal information. Passwords are hashed and stored securely. We use secure authentication and role-based access control to protect your data.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">4. Government Scheme Information</h2>
              <p>Information about government schemes (including PM Surya Ghar) is provided for general guidance only. We do not guarantee the accuracy of government scheme information. Please verify all scheme details through official government sources.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">5. Your Rights</h2>
              <p>You have the right to access your personal data, request corrections, and request deletion of your data. Contact us to exercise these rights.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">6. Cookies</h2>
              <p>We use essential cookies to maintain your session and language preferences. We do not use tracking cookies for advertising.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">7. Contact</h2>
              <p>For privacy-related questions, please contact us through the Contact page.</p>
            </div>
            <p className="text-sm text-slate-400 mt-8">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
