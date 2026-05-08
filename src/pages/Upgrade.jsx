import { useState, useEffect } from "react";
import { Check, Crown, Sparkles, FileText, History, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { hasPro, isInTrial, trialDaysLeft } from "@/lib/subscriptionUtils";
import { useNavigate } from "react-router-dom";

const FREE_FEATURES = [
  "Medication injection log",
  "Daily side effect check-in",
  "Last 14 days of data",
  "1 progress photo",
  "Basic dashboard",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited data history",
  "📈 Weight progress chart",
  "Unlimited progress photos",
  "Weekly PDF report export",
  "Sage AI wellness coach (unlimited chats)",
  "Personalized GLP-1 guidance daily",
  "Priority support",
  "Advanced analytics",
];

export default function Upgrade() {
  const [plan, setPlan] = useState('annual');
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.UserSettings.list()
      .then(s => {
        const sorted = s?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setSettings(sorted?.[0] || null);
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  const isPro = hasPro(settings);
  const isTrialing = isInTrial(settings);
  const trialUsed = new URLSearchParams(window.location.search).get('reason') === 'trial_used';

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me().catch(() => null);
      const result = await base44.functions.invoke('createCheckoutSession', {
        success_url: window.location.origin + '/settings?stripe_success=1',
        cancel_url: window.location.origin + '/upgrade',
        user_email: user?.email,
        plan,
      });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError('No checkout URL returned. Check that STRIPE_SECRET_KEY is set in app secrets.');
      }
    } catch (err) {
      setError('Checkout error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isPro && !isTrialing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <Crown className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">You're already on Pro 🎉</h2>
        <p className="text-sm text-muted-foreground">Your subscription is active. You have full access to all features.</p>
        <Button variant="outline" className="rounded-xl" onClick={() => window.open('https://billing.stripe.com/p/login/28o6oXfVq6K81ck7ss', '_blank')}>
          Manage Subscription
        </Button>
      </div>
    );
  }
  if (isTrialing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
        <Crown className="w-12 h-12 text-emerald-500" />
        <h2 className="text-xl font-bold text-foreground">You're on a Free Trial ✓</h2>
        <p className="text-sm text-muted-foreground">{trialDaysLeft(settings)} days remaining. Subscribe now to keep access after your trial ends.</p>
        <Button className="rounded-xl" onClick={handleUpgrade}>Subscribe Now — Keep Pro Access</Button>
      </div>
    );
  }

  // Free user — show full upgrade page
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {trialUsed && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">You've already used your free trial. Subscribe now to continue your journey.</p>
        </div>
      )}
      <div className="text-center pt-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Upgrade to Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">Unlock your full GLP-1 journey — free for 7 days</p>
      </div>

      <div className="flex bg-muted rounded-2xl p-1 max-w-xs mx-auto">
        <button onClick={() => setPlan('annual')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${plan === 'annual' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Annual {plan === 'annual' && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Best Value — Save 50%</span>}
        </button>
        <button onClick={() => setPlan('monthly')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${plan === 'monthly' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Free</p>
          <p className="text-3xl font-heading font-bold text-foreground mt-1">$0</p>
          <p className="text-xs text-muted-foreground">forever</p>
          <ul className="space-y-2.5 my-6">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full rounded-xl" disabled>Current Plan</Button>
        </div>

        <div className="bg-gradient-to-b from-primary/5 to-primary/10 border-2 border-primary rounded-2xl p-6 relative">
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">Most Popular</div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Pro</p>
          {plan === 'annual' ? (
            <>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-heading font-bold">$29.99</p>
                <p className="text-sm text-muted-foreground">/year</p>
              </div>
              <p className="text-xs text-muted-foreground">That's $2.50/month · <span className="text-emerald-600 font-semibold">Save 50%</span></p>
              <p className="text-xs text-muted-foreground">Less than half the price of competing apps.</p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-heading font-bold">$4.99</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
              <p className="text-xs text-muted-foreground">Billed monthly · Cancel anytime</p>
            </>
          )}
          <ul className="space-y-2.5 my-6">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full rounded-xl gap-2" onClick={handleUpgrade} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            {loading ? "Redirecting..." : trialUsed ? "Subscribe Now" : "Start Free Trial — 7 Days Free"}
          </Button>
          {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
          <div className="mt-3 text-center">
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">Try Pro free for 7 days — cancel anytime</span>
          </div>
          {!trialUsed && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {plan === 'annual' ? '$29.99/year' : '$4.99/month'} after 7-day trial
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-heading font-semibold">What you unlock</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: History, title: "Full History", desc: "All your records, always." },
            { icon: FileText, title: "PDF Reports", desc: "Share with your doctor." },
            { icon: Sparkles, title: "AI Insights", desc: "Weekly tips from Sage." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">🔒 Secure payment via Stripe · Cancel anytime</p>
      </div>
    </div>
  );
}