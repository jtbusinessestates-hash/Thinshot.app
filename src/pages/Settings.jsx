import React from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { User, Save, LogOut, Crown, Download, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ProGate from "@/components/ProGate";

const COUNTRIES = ["United States","Canada","United Kingdom","Australia","Germany","France","Netherlands","Sweden","Norway","Denmark","Ireland","Belgium","Austria","Switzerland","Spain","Italy","Portugal","Poland","Brazil","Mexico","India","South Africa","New Zealand","Other"];

export default function Settings() {
  const { logout } = useAuth();
  const [user, setUser] = React.useState(null);
  const [settings, setSettings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [showProGate, setShowProGate] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = React.useState({
    starting_weight: "", goal_weight: "", weight_unit: "kg", country: "",
  });

  const isPro = settings?.is_pro === true;

  React.useEffect(() => { loadData(); }, []);

  React.useEffect(() => {
    if (searchParams.get('pro') === 'success') {
      toast.success("🎉 Welcome to Pro! Your account has been upgraded.");
      setSearchParams({});
      setTimeout(loadData, 2000);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, s] = await Promise.all([
      base44.auth.me(),
      base44.entities.UserSettings.list("-created_date", 1),
    ]);
    setUser(u);
    if (s[0]) {
      setSettings(s[0]);
      setForm({
        starting_weight: s[0].starting_weight || "",
        goal_weight: s[0].goal_weight || "",
        weight_unit: s[0].weight_unit || "kg",
        country: s[0].country || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      starting_weight: form.starting_weight ? parseFloat(form.starting_weight) : undefined,
      goal_weight: form.goal_weight ? parseFloat(form.goal_weight) : undefined,
      weight_unit: form.weight_unit,
      country: form.country,
    };
    if (settings) {
      await base44.entities.UserSettings.update(settings.id, data);
    } else {
      await base44.entities.UserSettings.create(data);
    }
    toast.success("Settings saved!");
    await loadData();
    setSaving(false);
  };

  const handleUpgrade = async () => {
    setCheckingOut(true);
    try {
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
      setCheckingOut(false);
    }
  };

  const handleExport = async () => {
    if (!isPro) { setShowProGate(true); return; }
    const [ml, sl, wl, sets] = await Promise.all([
      base44.entities.MedicationLog.list('-injection_date', 1000),
      base44.entities.SideEffectLog.list('-log_date', 1000),
      base44.entities.WeightLog.list('-log_date', 1000),
      base44.entities.UserSettings.list('-created_date', 1),
    ]);
    const blob = new Blob(
      [JSON.stringify({ medications: ml, sideEffects: sl, weights: wl, settings: sets }, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'thinshot-data.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      {showProGate && <ProGate feature="Data export" onClose={() => setShowProGate(false)} />}

      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">{user?.full_name || "Your Name"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {isPro ? (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-900">Pro Plan Active ✓</p>
              <p className="text-sm text-amber-700">Unlimited photos, data export & advanced insights unlocked.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <p className="font-semibold text-amber-900">Free Plan</p>
          </div>
          <p className="text-sm text-amber-700 mb-4">Limited to 3 photos & 30 days of history. Upgrade for unlimited access, data export & advanced insights.</p>
          <ul className="space-y-1.5 mb-4">
            {['Unlimited progress photos','Photo comparison tool','Data export','Advanced insights & trends','Unlimited history'].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs text-amber-800">
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2"
            onClick={handleUpgrade}
            disabled={checkingOut}
          >
            <Crown className="w-4 h-4" />
            {checkingOut ? 'Redirecting to Stripe…' : 'Upgrade to Pro — $7.99/mo'}
          </Button>
        </div>
      )}

      {/* Weight Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="font-heading font-semibold text-sm text-foreground">Body & Goals</h2>
        <div className="space-y-1.5">
          <Label>Weight Unit</Label>
          <div className="flex rounded-xl border border-border overflow-hidden w-fit">
            {["kg", "lbs"].map(u => (
              <button
                key={u}
                onClick={() => setForm({ ...form, weight_unit: u })}
                className={`px-5 py-2 text-sm font-medium transition-all ${form.weight_unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Starting Weight ({form.weight_unit})</Label>
            <Input className="rounded-xl" type="number" step="0.1" value={form.starting_weight} onChange={e => setForm({ ...form, starting_weight: e.target.value })} placeholder="e.g. 95.0" />
          </div>
          <div className="space-y-1.5">
            <Label>Goal Weight ({form.weight_unit})</Label>
            <Input className="rounded-xl" type="number" step="0.1" value={form.goal_weight} onChange={e => setForm({ ...form, goal_weight: e.target.value })} placeholder="e.g. 75.0" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Country</Label>
          <select
            value={form.country}
            onChange={e => setForm({ ...form, country: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select country...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="w-full rounded-xl gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* GDPR / Data Controls */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="font-heading font-semibold text-sm text-foreground">Your Data</h2>
        <p className="text-xs text-muted-foreground">You have the right to export or permanently delete all your data at any time.</p>
        <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Download My Data
          {!isPro && <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>}
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => {
            if (window.confirm('This will permanently delete all your data. This cannot be undone. Are you sure?')) {
              toast.error('Please contact privacy@thinshot.app to complete account deletion.');
            }
          }}
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </Button>
      </div>

      {/* Legal Links */}
      <div className="flex gap-4 text-xs text-muted-foreground px-1">
        <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-xl gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={() => logout()}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}