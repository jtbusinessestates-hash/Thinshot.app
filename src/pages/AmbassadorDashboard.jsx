import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Users, MousePointer, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AmbassadorDashboard() {
  const [ambassador, setAmbassador] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await base44.auth.me();
        const [ambassadors, refs] = await Promise.all([
          base44.entities.Ambassador.filter({ email: user.email }),
          base44.entities.Referral.list('-created_date', 100),
        ]);
        setAmbassador(ambassadors?.[0] || null);
        setReferrals(refs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const referralLink = ambassador ? `https://thinshot.app?ref=${ambassador.referral_code}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalClicks = ambassador?.total_clicks || 0;
  const totalSignups = referrals.length;
  const totalEarned = referrals.reduce((sum, r) => sum + (r.commission || 0), 0);

  const shareText = encodeURIComponent(`Track your GLP-1 journey with ThinShot — 7-day free trial: ${referralLink}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ambassador Dashboard 💚</h1>
          <p className="text-gray-500">No ambassador account found for your email. Contact hello@thinshot.app to get set up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-emerald-600 font-heading">Your Ambassador Dashboard 💚</h1>
          <p className="text-gray-500 mt-1">Welcome back, {ambassador.name || 'Ambassador'}!</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MousePointer, label: 'Total Clicks', value: totalClicks, color: 'bg-blue-50 text-blue-600' },
            { icon: Users, label: 'Total Signups', value: totalSignups, color: 'bg-emerald-50 text-emerald-600' },
            { icon: DollarSign, label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, color: 'bg-amber-50 text-amber-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Your Referral Link</h2>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-mono truncate">
              {referralLink}
            </div>
            <Button onClick={handleCopy} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 flex-shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              📱 Instagram
            </a>
            <a
              href={`https://www.tiktok.com/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
            >
              🎵 TikTok
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              👍 Facebook
            </a>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Referral History</h2>
          </div>
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No referrals yet. Share your link to get started!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Commission</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700">{r.created_date ? format(new Date(r.created_date), 'MMM d, yyyy') : '—'}</td>
                      <td className="px-6 py-3 text-gray-700">{r.subscription_type || '—'}</td>
                      <td className="px-6 py-3 text-gray-700">{r.amount ? `$${r.amount}` : '—'}</td>
                      <td className="px-6 py-3 font-semibold text-emerald-600">{r.commission ? `$${r.commission}` : '—'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}