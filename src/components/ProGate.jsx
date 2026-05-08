import React from 'react';
import { Crown, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ProGate({ onClose, feature = 'This feature' }) {
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      const result = await base44.functions.invoke('createCheckoutSession', {
        success_url: window.location.origin + '/settings?pro=success',
        cancel_url: window.location.origin + '/upgrade',
        user_email: user?.email,
      });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        alert('No checkout URL returned. Check that STRIPE_SECRET_KEY is set in app secrets.');
      }
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h2 className="font-heading font-bold text-lg text-foreground mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground">{feature}</span> is a Pro feature. Unlock it for $7.99/month.
          </p>

          <ul className="space-y-2 mb-5">
            {[
              'Unlimited progress photos',
              'Photo comparison tool',
              'Data export (JSON)',
              'Advanced insights & trends',
              'Unlimited history',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2"
            onClick={handleUpgrade}
            disabled={loading}
          >
            <Crown className="w-4 h-4" />
            {loading ? 'Redirecting…' : 'Upgrade to Pro – $7.99/mo'}
          </Button>
          {onClose && (
            <Button variant="ghost" className="w-full rounded-xl mt-2 text-muted-foreground" onClick={onClose}>
              Maybe later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}