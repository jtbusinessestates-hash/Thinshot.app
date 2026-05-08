import React, { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REFERRAL_LINK = 'https://thinshot.app?ref=leslie';
const GRAPHIC_URL = 'https://media.base44.com/images/public/69dcf5531dbc4aa150329160/2180de5f5_generated_image.png';

const CAPTIONS = [
  `Been tracking my GLP-1 journey with this app and honestly it's changed everything 🙌 Ozempic/Wegovy/Mounjaro users — this one's for us. Track your shots, weight, side effects, and get an AI coach in your pocket. 7-day free trial → thinshot.app?ref=leslie #GLP1 #Ozempic #Wegovy #Mounjaro #ThinShot`,
  `POV: you finally have an app that actually gets what you're going through on GLP-1 meds 💉 ThinShot tracks everything — injections, weight, side effects, protein goals. My code gets you a free trial: thinshot.app?ref=leslie #GLP1Journey #OzempicCommunity #WomensHealth`,
  `Not sponsored — genuinely obsessed with ThinShot for tracking my Mounjaro journey. The Sage AI coach alone is worth it. Try it free for 7 days: thinshot.app?ref=leslie ✨ #Mounjaro #GLP1 #HealthApp #ThinShot`,
];

const TALKING_POINTS = [
  'ThinShot is built specifically for women on GLP-1 medications',
  'Tracks: injections, weight, side effects, photos, dose history',
  'Has an AI coach (Sage) trained on GLP-1 wellness',
  '7-day free trial, no credit card required',
  '$4.99/month or $29.99/year after trial',
];

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function LeslieKit() {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownloadGraphic = () => {
    const a = document.createElement('a');
    a.href = GRAPHIC_URL;
    a.download = 'thinshot-ambassador-graphic.png';
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 font-heading leading-tight">
            Your ThinShot Ambassador Kit 💚
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">That Girl Leslie</p>
        </div>

        {/* Your Link */}
        <div className="bg-emerald-500 rounded-2xl p-6 text-center space-y-4">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Your Referral Link</p>
          <p className="text-white text-2xl font-bold font-mono">{REFERRAL_LINK}</p>
          <Button
            onClick={handleCopyLink}
            className="bg-white text-emerald-600 hover:bg-gray-50 font-bold gap-2 rounded-xl"
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? 'Copied!' : 'Copy Your Link'}
          </Button>
        </div>

        {/* Shareable Graphic */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Shareable Graphic</h2>
          <img
            src={GRAPHIC_URL}
            alt="ThinShot Ambassador Graphic"
            className="w-full rounded-xl border border-gray-100"
          />
          <Button variant="outline" onClick={handleDownloadGraphic} className="w-full gap-2 rounded-xl">
            <Download className="w-4 h-4" /> Download Graphic
          </Button>
        </div>

        {/* Caption Templates */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Caption Templates</h2>
          <div className="space-y-4">
            {CAPTIONS.map((caption, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Caption {i + 1}</span>
                  <CopyButton text={caption} label="Copy Caption" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{caption}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Talking Points */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Talking Points</h2>
          <ul className="space-y-3">
            {TALKING_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* FTC Disclosure */}
        <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
          Disclosure: I earn a commission if you sign up through my referral link. I only recommend products I genuinely use and believe in.
        </p>
      </div>
    </div>
  );
}