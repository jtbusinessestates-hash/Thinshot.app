import React from 'react';
import { Link } from "react-router-dom";
import { Syringe } from "lucide-react";

const SECTIONS = [
  {
    heading: "What data we collect",
    items: [
      "Name and email address",
      "Health tracking data you enter (injections, side effects, weight, photos)",
      "Country and unit preferences",
      "App usage data (login times, feature usage)",
    ],
  },
  {
    heading: "Why we collect it",
    items: [
      "To provide the tracking features you use",
      "To send reminders you opt into",
      "To generate your Health Summary exports",
    ],
  },
  {
    heading: "Legal basis",
    items: [
      "Explicit consent for health data given at account creation",
      "Contract performance for account and billing data",
      "You may withdraw consent at any time via Settings",
    ],
  },
  {
    heading: "Who we share it with",
    items: [
      "Stripe (payment processing only — zero health data shared)",
      "No other third parties ever",
      "We never sell your data",
    ],
  },
  {
    heading: "US Users — HIPAA Notice",
    items: [
      "ThinShot is not a HIPAA covered entity",
      "This app is a personal wellness tracker only",
      "Do not use ThinShot as a substitute for medical records",
    ],
  },
  {
    heading: "How long we keep it",
    items: [
      "As long as your account is active",
      "Deleted within 30 days of account deletion request",
    ],
  },
  {
    heading: "Your rights",
    items: [
      "Access, correct, export, or delete your data anytime via Settings",
      "Withdraw consent at any time via Settings",
      "Lodge a complaint with your local data protection authority if applicable",
    ],
  },
  {
    heading: "Cookies",
    items: [
      "Essential cookies only",
      "No advertising or tracking cookies",
      "No third party analytics",
    ],
  },
];

export default function Privacy() {
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
          <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: 2025</p>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            ThinShot is committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we protect it.
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.heading}>
              <h2 className="text-base font-semibold text-gray-900 mb-3">{s.heading}</h2>
              <ul className="space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Contact</h2>
            <p className="text-sm text-gray-600">
              For privacy questions or data requests:{" "}
              <a href="mailto:privacy@thinshot.app" className="text-[#2ECC71] hover:underline">
                privacy@thinshot.app
              </a>
            </p>
          </div>
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