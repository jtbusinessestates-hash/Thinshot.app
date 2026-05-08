import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Syringe, BarChart2, Scale, Shield, ChevronDown,
  CheckCircle2, Menu, X, TrendingDown, Activity, Pill, Calculator
} from 'lucide-react';
import SageFloatingBubble from '@/components/SageFloatingBubble';

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onCTA }) {
  const [open, setOpen] = useState(false);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <img src="https://base44.app/api/apps/69dcf5531dbc4aa150329160/files/mp/public/69dcf5531dbc4aa150329160/b237afaa5_thinshot-logo.svg" alt="ThinShot" className="h-10 w-auto" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[['#features', 'Features'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
            <a key={label} href={href} onClick={(e) => scrollTo(e, href)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
              {label}
            </a>
          ))}
          <Link to="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Blog</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCTA} className="text-gray-600">Log in</Button>
          <Button size="sm" className="bg-[#2ECC71] hover:bg-[#27ae60] text-white shadow-sm" onClick={onCTA}>
            Get Started Free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          {[['#features', 'Features'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
            <a key={label} href={href} onClick={(e) => scrollTo(e, href)}
              className="text-sm text-gray-700 font-medium py-2 border-b border-gray-50">
              {label}
            </a>
          ))}
          <Link to="/blog" className="text-sm text-gray-700 font-medium py-2 border-b border-gray-50" onClick={() => setOpen(false)}>Blog</Link>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onCTA}>Log in</Button>
            <Button size="sm" className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-white" onClick={onCTA}>
              Start Free
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onCTA }) {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#2ECC71]/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Left: copy */}
        <div className="flex-1 text-center md:text-left">
          <Badge className="mb-5 bg-[#2ECC71]/10 text-[#1a9e54] border-[#2ECC71]/20 hover:bg-[#2ECC71]/10 text-xs font-semibold px-3 py-1">
            🌿 Private & Secure · Built for Everyone
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] mb-5 font-heading">
            Track Your<br />
            <span className="text-[#2ECC71]">GLP-1 Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
            Log your doses, monitor weight loss, and track side effects — all in one private, easy-to-use app. Built for Ozempic, Wegovy, Mounjaro & more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start flex-wrap whitespace-nowrap">
            <Button
              size="lg"
              className="bg-[#2ECC71] hover:bg-[#27ae60] text-white text-base px-8 h-12 shadow-lg shadow-[#2ECC71]/25 font-semibold"
              onClick={onCTA}
            >
              Get Started Free
            </Button>
            <a href="#features"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors h-12 px-4">
              See how it works <ChevronDown className="w-4 h-4" />
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required · Free forever plan available</p>
        </div>

        {/* Right: mock dashboard card */}
        <div className="flex-1 w-full max-w-sm mx-auto md:max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-[#2ECC71]/10 rounded-3xl blur-2xl scale-95" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-[#2ECC71] to-emerald-400 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/80 text-xs font-medium">Week 14 · Ozempic 1.0mg</p>
                    <p className="text-white font-bold text-lg">My Progress</p>
                  </div>
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Syringe className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['−12.8 lbs', 'Lost'], ['14 wks', 'Journey'], ['98%', 'On track']].map(([val, lbl]) => (
                    <div key={lbl} className="bg-white/20 rounded-xl p-2 text-center">
                      <p className="text-white font-bold text-base leading-none">{val}</p>
                      <p className="text-white/70 text-xs mt-0.5">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Card body */}
              <div className="px-5 py-4 space-y-3">
                {[
                    { label: 'Last injection', value: 'Yesterday · Stomach', icon: <Pill className="w-3.5 h-3.5 text-[#2ECC71]" /> },
                    { label: 'This week weight', value: '179 lbs (−0.9 lbs)', icon: <TrendingDown className="w-3.5 h-3.5 text-[#2ECC71]" /> },
                    { label: 'Side effects today', value: 'Mild nausea · 2/5', icon: <Activity className="w-3.5 h-3.5 text-[#2ECC71]" /> },
                  ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 bg-[#2ECC71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Goal progress</span>
                    <span className="font-semibold text-[#2ECC71]">58%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[58%] bg-gradient-to-r from-[#2ECC71] to-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trust Bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-5">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-12">
        {[
          { icon: <Shield className="w-4 h-4 text-[#2ECC71]" />, text: 'Private & Secure' },
          { icon: <Activity className="w-4 h-4 text-[#2ECC71]" />, text: 'Ozempic · Wegovy · Mounjaro · Saxenda' },
          { icon: <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />, text: 'No data sold. Ever.' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            {icon} {text}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <Calculator className="w-7 h-7 text-[#2ECC71]" />,
      title: 'Dose Click Calculator',
      desc: 'The only GLP-1 app with a built-in click counter. Get the exact number of clicks for your pen and tap your screen as you inject — never lose count again.',
      points: ['Ozempic, Wegovy, Mounjaro & Saxenda', 'Tap counter vibrates when done', 'Saves every session to your history'],
    },
    {
      icon: <Pill className="w-7 h-7 text-[#2ECC71]" />,
      title: 'Medication Logging',
      desc: 'Log every injection in seconds — track your dose, medication name, injection site, and date. Never miss a record again.',
      points: ['Ozempic, Wegovy, Mounjaro & more', 'Injection site rotation tracker', 'Upcoming dose reminders'],
    },
    {
      icon: <Scale className="w-7 h-7 text-[#2ECC71]" />,
      title: 'Weight & Progress Tracking',
      desc: 'Visualise your transformation with beautiful charts. Log weight, measurements, and progress photos over time.',
      points: ['Weekly weight trend charts', 'Body measurement tracking', 'Before & after photo timeline'],
    },
    {
      icon: <Activity className="w-7 h-7 text-[#2ECC71]" />,
      title: 'Side Effect Monitoring',
      desc: 'Daily check-ins to capture how you feel. Spot patterns and bring meaningful data to your doctor appointments.',
      points: ['Nausea, fatigue, mood ratings', 'Weekly side effect trends', 'Shareable health summary PDF'],
    },
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[#2ECC71]/10 text-[#1a9e54] border-[#2ECC71]/20 hover:bg-[#2ECC71]/10">
            Everything you need
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-heading">
            Your complete GLP-1 companion
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Designed for simplicity. Packed with insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group relative bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2ECC71] to-emerald-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-[#2ECC71]/10 rounded-2xl flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-3 font-heading">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.desc}</p>
              <ul className="space-y-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#2ECC71] flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────────────────────────
function Pricing({ onCTA }) {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const free = [
    '7-day free trial',
    'Injection logging',
    'Side effect tracking',
    'Email reminders',
    '1 progress photo',
  ];
  const pro = [
    'Dose-coded weight chart',
    'Estimated medication level',
    'PDF doctor report',
    'Shareable milestone card',
    'Sage AI coach',
    'Unlimited history',
    'Unlimited photos',
  ];

  return (
    <section id="pricing" className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[#2ECC71]/10 text-[#1a9e54] border-[#2ECC71]/20 hover:bg-[#2ECC71]/10">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-heading">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Toggle — Annual first/default */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isAnnual ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Annual
            {isAnnual && <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">Save 50%</span>}
          </button>
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${!isAnnual ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Monthly
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <h3 className="font-bold text-xl text-gray-900 mb-1 font-heading">Free</h3>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-500">Perfect to get started on your journey.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {free.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full h-11 font-semibold" onClick={onCTA}>
              Start Free
            </Button>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-br from-[#2ECC71]/5 via-white to-emerald-50 border-2 border-[#2ECC71] rounded-2xl p-7 flex flex-col shadow-lg shadow-[#2ECC71]/10">
            <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white border-0 hover:bg-emerald-600 px-4 py-1 text-xs font-bold whitespace-nowrap">
              {isAnnual ? 'Best Value — Save 50%' : 'Most Popular'}
            </Badge>
            <div className="mb-6">
              <h3 className="font-bold text-xl text-gray-900 mb-1 font-heading">Pro</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">${isAnnual ? '2.50' : '4.99'}</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">Less than half the price of competing apps.</p>
              {isAnnual && <p className="text-xs text-emerald-600 font-semibold">Billed $29.99/year · Save 50%</p>}
              {!isAnnual && <p className="text-xs text-gray-500">Billed monthly · $4.99/mo</p>}
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {pro.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#2ECC71] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full h-11 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold shadow-md shadow-[#2ECC71]/20"
              onClick={onCTA}
            >
              Upgrade to Pro
            </Button>
            <p className="text-center text-xs text-gray-400 mt-2">Try Pro free for 7 days — no credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'Is my health data private?', a: 'Yes. ThinShot is fully private and secure. Your data is never sold or shared with third parties.' },
  { q: 'Which medications does ThinShot support?', a: 'Ozempic, Wegovy, Mounjaro, Saxenda, Zepbound, and any custom GLP-1 medication.' },
  { q: 'Does it work on my phone?', a: 'Yes — install directly from your browser. No App Store needed. Works on iOS and Android.' },
  { q: 'Can I cancel Pro anytime?', a: 'Yes. Cancel anytime with one click, no questions asked.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 font-heading">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-medium text-gray-900 hover:bg-gray-100 transition-colors text-sm"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {item.q}
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner({ onCTA }) {
  return (
    <section className="bg-gradient-to-r from-[#2ECC71] to-emerald-500 py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-heading">
          Start your journey today
        </h2>
        <p className="text-white/80 text-lg mb-8">
          Join people transforming their health with ThinShot
        </p>
        <Button
          size="lg"
          className="bg-white text-[#2ECC71] hover:bg-gray-50 font-bold px-8 h-12 text-base shadow-lg"
          onClick={onCTA}
        >
          Get Started Free
        </Button>
        <p className="mt-4 text-white/60 text-sm">No credit card required</p>
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wide">Also coming soon</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl opacity-60 cursor-not-allowed">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div className="text-left">
                <p className="text-[9px] leading-none opacity-70">Coming soon on</p>
                <p className="text-sm font-semibold leading-tight">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl opacity-60 cursor-not-allowed">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.08l13.5-7.76-2.95-2.95-11.51 10.63zM.4 1.81C.15 2.12 0 2.56 0 3.13v17.74c0 .57.15 1.01.4 1.32l.07.07 9.93-9.93v-.23L.47 1.74l-.07.07zM20.49 10.34l-2.82-1.63-3.27 3.27 3.27 3.27 2.84-1.64c.81-.47.81-1.23-.02-1.7v-.57zM4.14.24L17.64 8c0 0-11.5 10.63-11.5 10.63L3.18.32C3.49.21 3.84.07 4.14.24z"/></svg>
              <div className="text-left">
                <p className="text-[9px] leading-none opacity-70">Coming soon on</p>
                <p className="text-sm font-semibold leading-tight">Google Play</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <img src="https://base44.app/api/apps/69dcf5531dbc4aa150329160/files/mp/public/69dcf5531dbc4aa150329160/b237afaa5_thinshot-logo.svg" alt="ThinShot" className="h-8 w-auto" />
          <div>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Your GLP-1 Shot. Your Transformation.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:hello@thinshot.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600 space-y-1">
          <p>Need help? <a href="mailto:support@thinshot.app" className="text-gray-400 hover:text-white transition-colors">support@thinshot.app</a></p>
          <p>© 2026 ThinShot. All rights reserved. Available Worldwide.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    // Capture affiliate ref codes from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('thinshot_ref_code', refCode.toUpperCase());
      localStorage.setItem('thinshot_ref', refCode);
      base44.functions.invoke('trackReferral', { referral_code: refCode, event_type: 'click' }).catch(() => {});
    }
    // Do NOT check auth here — App.jsx handles redirecting logged-in users
  }, []);

  const handleCTA = () => {
    base44.auth.redirectToLogin('/onboarding');
  };

  return (
    <div className="min-h-screen font-body">
      <Navbar onCTA={handleCTA} />
      <Hero onCTA={handleCTA} />
      <TrustBar />
      <Features />
      <Pricing onCTA={handleCTA} />
      <FAQ />
      <CTABanner onCTA={handleCTA} />
      <Footer />
      <SageFloatingBubble />
    </div>
  );
}