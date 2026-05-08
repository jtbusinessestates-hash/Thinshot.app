import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { User, Save, LogOut, Crown, Download, Trash2, AlertTriangle, RefreshCw, Shield, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ProGate from "@/components/ProGate";
import BackToDashboard from "@/components/BackToDashboard";

const COUNTRIES = ["United States","Canada","United Kingdom","Australia","Germany","France","Netherlands","Sweden","Norway","Denmark","Ireland","Belgium","Austria","Switzerland","Spain","Italy","Portugal","Poland","Brazil","Mexico","India","South Africa","New Zealand","Other"];

function ReferSection({ userId }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(`https://thinshot.app?ref=${userId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-semibold text-sm text-foreground">Refer a Friend</h2>
      </div>
      <p className="text-sm text-muted-foreground">Love ThinShot? Share with a friend on their GLP-1 journey 💚</p>
      <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleCopy}>
        <Share2 className="w-4 h-4" />
        {copied ? "Copied!" : "Copy Referral Link"}
      </Button>
    </div>
  );
}

export default function Settings() {
  useAuth();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProGate, setShowProGate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    starting_weight: "", goal_weight: "", weight_unit: "kg", country: "",
  });

  const [restoring, setRestoring] = React.useState(false);
  const [achievements, setAchievements] = useState([]);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  const ACHIEVEMENT_SEEDS = [
    { achievement_key:'shot_streak_7', category:'Shot Streaks', label:'7-Day Shot Streak', description:'Log your injection 7 days in a row', emoji:'💉' },
    { achievement_key:'shot_streak_30', category:'Shot Streaks', label:'30-Day Shot Streak', description:'Log your injection 30 days in a row', emoji:'💉' },
    { achievement_key:'shot_streak_60', category:'Shot Streaks', label:'60-Day Shot Streak', description:'Log your injection 60 days in a row', emoji:'💉' },
    { achievement_key:'shot_streak_90', category:'Shot Streaks', label:'90-Day Shot Streak', description:'Log your injection 90 days in a row', emoji:'💉' },
    { achievement_key:'weight_5lbs', category:'Weight Milestones', label:'First 5 lbs Lost', description:'Lose your first 5 lbs from starting weight', emoji:'⚖️' },
    { achievement_key:'weight_10lbs', category:'Weight Milestones', label:'10 lbs Lost', description:'Lose 10 lbs from starting weight', emoji:'⚖️' },
    { achievement_key:'weight_25lbs', category:'Weight Milestones', label:'25 lbs Lost', description:'Lose 25 lbs from starting weight', emoji:'⚖️' },
    { achievement_key:'weight_50lbs', category:'Weight Milestones', label:'50 lbs Lost', description:'Lose 50 lbs from starting weight', emoji:'⚖️' },
    { achievement_key:'inches_first', category:'Inches Lost', label:'First Inch Lost', description:'Lose your first inch on any body measurement', emoji:'📏' },
    { achievement_key:'inches_5', category:'Inches Lost', label:'5 Inches Lost', description:'Lose 5 total inches across all measurements', emoji:'📏' },
    { achievement_key:'inches_10', category:'Inches Lost', label:'10 Inches Lost', description:'Lose 10 total inches across all measurements', emoji:'📏' },
    { achievement_key:'protein_3day', category:'Protein Goals', label:'Protein Streak: 3 Days', description:'Hit your protein goal 3 days in a row', emoji:'🥩' },
    { achievement_key:'protein_7day', category:'Protein Goals', label:'Protein Streak: 7 Days', description:'Hit your protein goal 7 days in a row', emoji:'🥩' },
    { achievement_key:'protein_30day', category:'Protein Goals', label:'Protein Streak: 30 Days', description:'Hit your protein goal 30 days in a row', emoji:'🥩' },
    { achievement_key:'photo_first', category:'Photo Journey', label:'First Progress Photo', description:'Add your first progress photo', emoji:'📸' },
    { achievement_key:'photo_30day', category:'Photo Journey', label:'30-Day Photo', description:'Add a progress photo at 30 days', emoji:'📸' },
    { achievement_key:'photo_90day', category:'Photo Journey', label:'90-Day Photo', description:'Add a progress photo at 90 days', emoji:'📸' },
    { achievement_key:'sage_1', category:'Sage Sessions', label:'First Sage Chat', description:'Ask Sage your first question', emoji:'🌿' },
    { achievement_key:'sage_5', category:'Sage Sessions', label:'Sage Regular', description:'Ask Sage 5 questions', emoji:'🌿' },
    { achievement_key:'sage_25', category:'Sage Sessions', label:'Sage Power User', description:'Ask Sage 25 questions', emoji:'🌿' },
    { achievement_key:'recipe_1', category:'Recipe Explorer', label:'First Recipe Tried', description:'Add a recipe to your day', emoji:'🍳' },
    { achievement_key:'recipe_5', category:'Recipe Explorer', label:'Recipe Explorer', description:'Try 5 different recipes', emoji:'🍳' },
    { achievement_key:'recipe_10', category:'Recipe Explorer', label:'Kitchen Pro', description:'Try 10 different recipes', emoji:'🍳' },
    { achievement_key:'consistency_7', category:'Consistency Queen', label:'7-Day Consistency', description:'Log something every day for 7 days', emoji:'🔥' },
    { achievement_key:'consistency_14', category:'Consistency Queen', label:'14-Day Consistency', description:'Log something every day for 14 days', emoji:'🔥' },
    { achievement_key:'consistency_30', category:'Consistency Queen', label:'30-Day Consistency', description:'Log something every day for 30 days', emoji:'🔥' },
  ];

  async function seedAchievements() {
    for (const a of ACHIEVEMENT_SEEDS) {
      await base44.entities.Achievement.create({ ...a, earned: false, is_new: false });
    }
  }

  const loadAchievements = async () => {
    const existing = await base44.entities.Achievement.list('-created_date', 100);
    if (existing.length === 0) {
      await seedAchievements();
      const seeded = await base44.entities.Achievement.list('-created_date', 100);
      setAchievements(seeded);
    } else {
      setAchievements(existing);
    }
  };

  const isPro = settings?.is_pro === true || ['trialing', 'active', 'trial'].includes(settings?.subscription_status || '');
  const showCancelOption = 
    settings?.is_pro === true &&
    ['active', 'trialing'].includes(settings?.subscription_status || '') &&
    settings?.pro_lifetime !== true;
  const isFullPro = settings?.is_pro === true && settings?.subscription_status === 'active';
  const isTrialing = !isFullPro && settings?.is_pro !== true && ['trialing', 'trial'].includes(settings?.subscription_status || '');
  const trialEnd = settings?.trial_end || settings?.trial_ends_at;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((new Date(trialEnd) - new Date()) / 86400000)) : null;

  useEffect(() => { loadData(); loadAchievements(); }, []);

  React.useEffect(() => {
    if (searchParams.get('pro') !== 'success') return;
    setSearchParams({});
    toast.success("Payment confirmed! Activating your Pro account...");
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const s = await base44.entities.UserSettings.list("-created_date", 1);
        const updated = s?.[0];
        if (updated && (updated.is_pro === true || ['active','trialing','trial'].includes(updated.subscription_status))) {
          setSettings(updated);
          toast.success("Welcome to Pro! 💚");
          setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
          return;
        }
        if (attempts < 15) {
          setTimeout(poll, 3000);
        } else {
          if (updated) setSettings({ ...updated, is_pro: true, subscription_status: 'active' });
          toast.success("Welcome to Pro! 💚");
          setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
        }
      } catch (e) { if (attempts < 15) setTimeout(poll, 3000); }
    };
    setTimeout(poll, 3000);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, s] = await Promise.all([
      base44.auth.me(),
      base44.entities.UserSettings.list(),
    ]);
    setUser(u);
    const s0 = s?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
    if (s0) {
      setSettings(s0);
      setForm({
        starting_weight: s0.starting_weight || "",
        goal_weight: s0.goal_weight || "",
        weight_unit: s0.weight_unit || "kg",
        country: s0.country || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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
      toast.success("Settings saved! ✓");
      await loadData();
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    const email = user?.email;
    if (!email) { toast.error("Please sign in first."); return; }
    setRestoring(true);
    try {
      const result = await base44.functions.invoke('restoreSubscription', { user_email: email });
      if (result?.restored || result?.data?.restored) {
        toast.success("Pro access restored! ✅ Reloading...");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.error(result?.message || result?.data?.message || "No active subscription found.");
        setRestoring(false);
      }
    } catch (err) {
      toast.error("Restore failed: " + err.message);
      setRestoring(false);
    }
  };

  const handleDoctorReport = async () => {
    const [ml, sl, wl] = await Promise.all([
      base44.entities.MedicationLog.list('-injection_date', 1000),
      base44.entities.SideEffectLog.list('-date', 1000),
      base44.entities.WeightLog.list('-date', 1000),
    ]);
    const sortedW = [...wl].sort((a, b) => new Date(a.date) - new Date(b.date));
    const startW = settings?.starting_weight || sortedW[0]?.weight;
    const latestW = sortedW[sortedW.length - 1]?.weight;
    const totalLost = startW && latestW ? (startW - latestW).toFixed(1) : "N/A";
    const latestMed = ml[0];
    // Top 3 side effects by frequency
    const seCounts = {};
    sl.forEach(l => {
      if (l.nausea > 3) seCounts["Nausea"] = (seCounts["Nausea"] || 0) + 1;
      if (l.fatigue > 3) seCounts["Fatigue"] = (seCounts["Fatigue"] || 0) + 1;
      if (l.appetite < 3) seCounts["Low Appetite"] = (seCounts["Low Appetite"] || 0) + 1;
      if (l.mood < 3) seCounts["Mood Changes"] = (seCounts["Mood Changes"] || 0) + 1;
    });
    const topSE = Object.entries(seCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const firstName = user?.full_name?.split(" ")[0] || "Patient";
    const reportDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ThinShot Doctor Report</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 24px;color:#1a1a1a}
h1{font-size:22px;margin-bottom:4px}h2{font-size:15px;margin-top:28px;margin-bottom:8px;color:#059669;border-bottom:1px solid #d1fae5;padding-bottom:4px}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:14px}
.label{color:#6b7280}.value{font-weight:600}footer{margin-top:48px;font-size:11px;color:#9ca3af;text-align:center}
</style></head><body>
<h1>GLP-1 Progress Report</h1>
<p style="color:#6b7280;font-size:13px">Generated: ${reportDate}</p>
<h2>Patient</h2>
<div class="row"><span class="label">Name</span><span class="value">${firstName}</span></div>
<h2>Weight Summary</h2>
<div class="row"><span class="label">Starting Weight</span><span class="value">${startW ? startW + " " + (settings?.weight_unit || "kg") : "N/A"}</span></div>
<div class="row"><span class="label">Current Weight</span><span class="value">${latestW ? latestW + " " + (settings?.weight_unit || "kg") : "N/A"}</span></div>
<div class="row"><span class="label">Total Lost</span><span class="value">${totalLost !== "N/A" ? totalLost + " " + (settings?.weight_unit || "kg") : "N/A"}</span></div>
<h2>Medication</h2>
<div class="row"><span class="label">Injections Logged</span><span class="value">${ml.length}</span></div>
<div class="row"><span class="label">Current Medication</span><span class="value">${latestMed ? (latestMed.drug_name === "Custom" ? latestMed.custom_drug_name : latestMed.drug_name) : "N/A"}</span></div>
<div class="row"><span class="label">Current Dose</span><span class="value">${latestMed ? latestMed.dose_mg + "mg" : "N/A"}</span></div>
<h2>Reported Side Effects (Top 3)</h2>
${topSE.length ? topSE.map(se => `<div class="row"><span class="label">${se}</span><span class="value">Reported</span></div>`).join("") : '<p style="font-size:13px;color:#6b7280">No significant side effects reported.</p>'}
<footer>Generated by ThinShot — thinshot.app · For informational purposes only. Not a substitute for medical advice.</footer>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  const handleExport = async () => {
    if (!isPro) { setShowProGate(true); return; }
    const [ml, sl, wl, sets] = await Promise.all([
      base44.entities.MedicationLog.list('-injection_date', 1000),
      base44.entities.SideEffectLog.list('-date', 1000),
      base44.entities.WeightLog.list('-date', 1000),
      base44.entities.UserSettings.list(),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showProGate && <ProGate feature="Data export" onClose={() => setShowProGate(false)} />}

      <BackToDashboard />
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
      {settings === null && loading ? (
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isPro ? (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">Pro Member ✓</p>
              <p className="text-sm text-emerald-700">All features unlocked. Thank you for supporting ThinShot 💚</p>
            </div>
          </div>
        </div>
      ) : settings !== null && !isPro ? (
        <div>
          <ProGate inline feature="Pro Plan" />
          <Button variant="ghost" className="w-full mt-2 rounded-xl text-sm text-muted-foreground gap-2" onClick={handleRestore} disabled={restoring}>
            <RefreshCw className={`w-4 h-4 ${restoring ? 'animate-spin' : ''}`} />
            {restoring ? 'Checking Stripe...' : 'Restore Purchase'}
          </Button>
        </div>
      ) : null}

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

      {/* Privacy Promise */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="font-heading font-semibold text-sm text-foreground">Privacy Promise</h2>
        </div>
        <ul className="space-y-2">
          {["Your data is never sold to third parties", "Your data is encrypted and stored securely", "You can delete everything at any time"].map(p => (
            <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Doctor Report (Pro) */}
      {isPro && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Doctor Report</h2>
          </div>
          <p className="text-xs text-muted-foreground">Generate a printable summary of your GLP-1 journey to share with your healthcare provider.</p>
          <Button className="w-full rounded-xl gap-2" onClick={handleDoctorReport}>
            <Download className="w-4 h-4" />
            Generate Doctor Report (PDF)
          </Button>
        </div>
      )}

      {/* GDPR / Data Controls */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="font-heading font-semibold text-sm text-foreground">Your Data</h2>
        <p className="text-xs text-muted-foreground">You have the right to export or permanently delete all your data at any time.</p>
        <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Download My Data
          {!isPro && <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>}
        </Button>
        {showCancelOption && (
          <div>
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setShowCancelConfirm(true)}
            >
              <Trash2 className="w-4 h-4" /> Cancel Subscription
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-1.5">You'll keep Pro access until the end of your billing period.</p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full rounded-xl gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4" /> Delete My Account
        </Button>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-start gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground text-base">Cancel your subscription?</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll keep Pro access until{' '}
                  {settings?.trial_end
                    ? new Date(settings.trial_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'the end of your billing period'}
                  . After that, your account will revert to the free plan.
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <Button
                className="w-full rounded-xl"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep My Plan
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                disabled={cancelling}
                onClick={async () => {
                  setCancelling(true);
                  try {
                    const subId = settings?.stripe_subscription_id;
                    if (!subId) throw new Error('No subscription ID found.');
                    const res = await base44.functions.invoke('cancelSubscription', { subscriptionId: subId });
                    const cancelAt = res?.data?.current_period_end
                      ? new Date(res.data.current_period_end * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'the end of your billing period';
                    setSettings(prev => ({ ...prev, subscription_status: 'canceled' }));
                    setShowCancelConfirm(false);
                    toast.success(`Subscription cancelled. You'll have Pro access until ${cancelAt}.`);
                  } catch (err) {
                    toast.error('Failed to cancel: ' + err.message);
                  } finally {
                    setCancelling(false);
                  }
                }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3 p-5 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground text-base">Delete Your Account?</h3>
                <p className="text-xs text-muted-foreground mt-2">This is permanent and cannot be undone. All your data including weight logs, medication history, photos, and check-ins will be permanently deleted.</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <p className="text-sm font-medium text-destructive mb-2">How to proceed:</p>
                <p className="text-xs text-destructive/80 leading-relaxed">
                  Please send an email to <span className="font-semibold">privacy@thinshot.app</span> with the subject "Delete My Account" and confirm your identity. We'll process your request within 7 business days.
                </p>
              </div>
              <a href="mailto:privacy@thinshot.app?subject=Delete%20My%20Account" className="block px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm text-center hover:bg-primary/90 transition-colors">
                Send Deletion Request
              </a>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={() => setAchievementsOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <span className="font-heading font-semibold text-sm text-foreground">My Achievements</span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {achievements.filter(a => a.earned).length}/{achievements.length}
            </span>
          </div>
          {achievementsOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {achievementsOpen && (
          <div className="px-5 pb-5 space-y-5">
            {(() => {
              const grouped = {};
              achievements.forEach(a => {
                if (!grouped[a.category]) grouped[a.category] = [];
                grouped[a.category].push(a);
              });
              return Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{category}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map(a => {
                      const isNew = a.earned && a.is_new && a.earned_date &&
                        (Date.now() - new Date(a.earned_date).getTime()) < 48 * 3600 * 1000;
                      return (
                        <div
                          key={a.achievement_key}
                          className="relative border border-border rounded-xl p-3 text-center cursor-pointer"
                          style={!a.earned ? { filter: 'grayscale(1) opacity(0.5)' } : {}}
                          onClick={() => !a.earned && alert(a.description)}
                        >
                          {isNew && (
                            <span className="absolute top-0 right-0 bg-amber-400 text-white text-[9px] px-1 rounded-bl-lg font-bold">NEW</span>
                          )}
                          {!a.earned && (
                            <span className="absolute top-1 right-1 text-xs">🔒</span>
                          )}
                          <div style={{ fontSize: 28 }}>{a.emoji}</div>
                          <p className="text-xs font-semibold text-foreground mt-1 leading-tight">{a.label}</p>
                          {a.earned && a.earned_date && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(a.earned_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Refer a Friend */}
      {user && <ReferSection userId={user.id} />}

      {/* Need Help */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-primary" style={{ display: 'none' }} />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Need Help?</p>
          <a href="mailto:hello@thinshot.app" className="text-sm text-primary hover:underline">hello@thinshot.app</a>
        </div>
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
        onClick={async () => {
          try { base44.auth.logout(); } catch(_) {}
          window.location.replace('/');
        }}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}