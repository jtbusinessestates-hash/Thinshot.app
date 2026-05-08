import React from 'react';
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By using ThinShot you agree to these Terms of Service. If you do not agree, do not use the app.",
  },
  {
    title: "2. What ThinShot Is",
    body: "ThinShot is a personal health tracking application that allows users to log GLP-1 medication injections, monitor side effects, and track weight progress. ThinShot is not a medical device, medical service, or healthcare provider.",
  },
  {
    title: "3. Not Medical Advice",
    body: "ThinShot does not provide medical advice, diagnosis, or treatment recommendations. All content and features are for personal informational tracking purposes only. Always consult a qualified healthcare professional before making any changes to your medication or treatment plan. Never disregard professional medical advice because of something you read or tracked in ThinShot.",
  },
  {
    title: "4. Not a HIPAA Covered Entity",
    body: "ThinShot is a personal wellness tracking tool and is not a HIPAA covered entity under US law. Users should not submit protected health information expecting HIPAA protections. ThinShot stores data securely but does not operate as a healthcare provider or business associate under HIPAA.",
  },
  {
    title: "5. Health Summary Export",
    body: 'The Health Summary PDF export provides a summary of your own logged data in a readable format. It is not a medical document and should not be treated as one. ThinShot accepts no liability for how this data is interpreted or used.',
  },
  {
    title: "6. User Accounts",
    body: "You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. You must be 18 or older to use ThinShot.",
  },
  {
    title: "7. Subscription and Billing",
    body: "The Pro plan is billed at $7.99/month (USD) via Stripe. You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds for partial months. Prices may change with 30 days notice.",
  },
  {
    title: "8. Data and Privacy",
    body: "Your health data is private and stored securely. We do not sell, share, or license your personal data to third parties. You can request a full export or deletion of your data at any time via Settings. See our Privacy Policy for full details.",
  },
  {
    title: "9. Your Data Rights",
    body: "Regardless of where you are located, you have the right to: access your data, correct your data, delete your data, export your data, and withdraw consent at any time. To exercise these rights use the Settings page or contact us at privacy@thinshot.app",
  },
  {
    title: "10. Prohibited Use",
    body: "You may not use ThinShot to: provide medical advice to others, resell or redistribute the service, attempt to access other users' data, or use the app for any unlawful purpose.",
  },
  {
    title: "11. Limitation of Liability",
    body: "ThinShot is provided as-is. We are not liable for any health decisions made based on data tracked in the app. We are not liable for data loss, service interruptions, or indirect damages. Maximum liability is limited to fees paid in the last 3 months.",
  },
  {
    title: "12. Governing Law",
    body: "This app is available worldwide. Applicable law will be determined based on your jurisdiction.",
  },
  {
    title: "13. Changes to Terms",
    body: "We may update these terms. Users will be notified by email. Continued use after changes means acceptance.",
  },
  {
    title: "14. Contact",
    body: "legal@thinshot.app",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-white font-body">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2ECC71] flex items-center justify-center">
              <Syringe className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">ThinShot</span>
          </Link>
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: 2025</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <span>© 2025 ThinShot. Private &amp; Secure. Available Worldwide.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}