import { useState } from "react";
import { Check, Crown, Sparkles, FileText, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const FREE_FEATURES = [
  "Medication injection log",
  "Daily side effect check-in",
  "Weight & measurements tracking",
  "Last 30 days of data",
  "Basic dashboard",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited data history",
  "Weekly PDF report export",
  "AI personalised tips",
  "Priority support",
  "Advanced analytics",
];

export default function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center pt-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Upgrade to Pro</h1>
        <p className="text-muted-foreground mt-2 text-sm">Unlock your full GLP-1 journey with advanced tracking tools</p>
      </div>

      {/* Plan Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Free</p>
            <p className="text-3xl font-heading font-bold text-foreground mt-1">$0</p>
            <p className="text-xs text-muted-foreground">forever</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full rounded-xl" disabled>Current Plan</Button>
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-b from-primary/5 to-primary/10 border-2 border-primary rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
            Popular
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Pro</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-heading font-bold text-foreground">$7.99</p>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
            <p className="text-xs text-muted-foreground">or $79.99/year (save 17%)</p>
          </div>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full rounded-xl gap-2" onClick={handleUpgrade} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            {loading ? "Redirecting..." : "Upgrade Now"}
          </Button>
          {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}
          <p className="text-xs text-muted-foreground text-center mt-3">Cancel anytime. No hidden fees.</p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-3">
        <h2 className="text-sm font-heading font-semibold text-foreground">What you unlock</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: History, title: "Full History", desc: "Never lose a data point. Access all your records, always." },
            { icon: FileText, title: "PDF Reports", desc: "Share weekly summaries with your doctor or dietician." },
            { icon: Sparkles, title: "AI Insights", desc: "Personalised weekly tips based on your trends and medication." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">🔒 Secure payment via Stripe · Private & secure · Cancel anytime</p>
      </div>
    </div>
  );
}