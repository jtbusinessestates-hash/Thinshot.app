import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { updateStreak } from '@/utils/streakUtils';
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { TrendingDown, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmptyState from "../components/EmptyState";
import BackToDashboard from "../components/BackToDashboard";
import DoseWeightChart from "../components/DoseWeightChart";
import MedLevelChart from "../components/MedLevelChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { format, parseISO, differenceInDays } from "date-fns";
import { useProStatus } from "@/hooks/useProStatus";

export default function Progress() {
  const { isPro } = useProStatus();
  const [settings, setSettings] = React.useState(null);
  const [logs, setLogs] = React.useState([]);
  const [medLogs, setMedLogs] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCycleWindow, setShowCycleWindow] = useState(true);
  const [localCycleStart, setLocalCycleStart] = React.useState("");
  const [localCycleLen, setLocalCycleLen] = React.useState(28);
  const [savingCycle, setSavingCycle] = React.useState(false);
  const [form, setForm] = React.useState({ weight: "", unit: "kg", date: format(new Date(), "yyyy-MM-dd"), notes: "", waist_cm: "", hips_cm: "" });

  React.useEffect(() => {
    const cleanJunkWeights = async () => {
      const JUNK_WEIGHT_IDS = [
        "69fd47cfb142ebf0f5c1883f","69fd42bdef52eab5e3c0d731",
        "69fce28eadbd905b332a5dcc","69fce26b08f98aa9c96c6e71",
        "69e3a894f73951e5df6f60bb","69e38905fc2b06fccfa154ab",
      ];
      for (const id of JUNK_WEIGHT_IDS) {
        try { await base44.entities.WeightLog.delete(id); } catch(e) {}
      }
    };
    cleanJunkWeights();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wl, s, ml] = await Promise.all([
        base44.entities.WeightLog.list("-date", 60),
        base44.entities.UserSettings.list(),
        base44.entities.MedicationLog.list("-injection_date", 30),
      ]);
      setLogs(wl);
      setMedLogs(ml || []);
      const s0 = s?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0] || null;
      setSettings(s0);
      if (s0) {
        setLocalCycleStart(s0.cycle_start_date || "");
        setLocalCycleLen(s0.cycle_length || 28);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const unit = settings?.weight_unit || "kg";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const optimisticLog = {
      id: `temp-${Date.now()}`,
      weight: parseFloat(form.weight),
      unit: unit,
      date: form.date,
      notes: form.notes || "",
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : null,
    };
    
    setLogs([optimisticLog, ...logs]);
    setShowForm(false);
    setForm({ weight: "", unit: unit, date: format(new Date(), "yyyy-MM-dd"), notes: "", waist_cm: "", hips_cm: "" });
    setSaving(true);
    
    try {
      await base44.entities.WeightLog.create({
        weight: parseFloat(form.weight),
        unit: unit,
        date: form.date,
        notes: form.notes || "",
        waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
        hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : null,
      });
      await updateStreak();
      toast.success("Weight logged! ✓");
      await loadData();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setLogs(logs.filter(l => l.id !== optimisticLog.id));
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const { containerRef: pullRef } = usePullToRefresh(handleRefresh);

  const handleDelete = async (logId) => {
    if (!logId) { console.error("No record ID to delete"); return; }
    if (!window.confirm("Delete this weight entry? This cannot be undone.")) return;
    try {
      await base44.entities.WeightLog.delete(logId);
      toast.success("Deleted successfully");
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete. Please try again.");
    }
  };

  const safeChartData = [...logs]
    .filter(l => l.date && l.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(l => ({ date: format(parseISO(l.date), "MMM d"), weight: l.weight }));

  const sortedAsc = [...logs].filter(l => l.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  const sortedDesc = [...logs].filter(l => l.date).sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalLost = sortedAsc.length >= 2 ? (sortedAsc[0].weight - sortedAsc[sortedAsc.length - 1].weight).toFixed(1) : null;
  const latest = sortedDesc[0];

  return (
    <div ref={pullRef} className="space-y-6 overflow-y-auto">
      <BackToDashboard />
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-spin" />
            <span className="text-xs font-medium text-foreground">Refreshing...</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground">Weight & body measurements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Log Weight
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Log Weight</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Weight ({unit})*</Label>
                  <Input className="rounded-xl" type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder={`e.g. 85.5 ${unit}`} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Date</Label>
                  <Input className="rounded-xl" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Waist (cm)</Label>
                  <Input className="rounded-xl" type="number" step="0.1" value={form.waist_cm} onChange={e => setForm({ ...form, waist_cm: e.target.value })} placeholder="e.g. 80" />
                </div>
                <div className="space-y-1.5">
                  <Label>Hips (cm)</Label>
                  <Input className="rounded-xl" type="number" step="0.1" value={form.hips_cm} onChange={e => setForm({ ...form, hips_cm: e.target.value })} placeholder="e.g. 95" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={saving || !form.weight} className="flex-1 rounded-xl">
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {settings?.goal_weight && !loading && logs.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-accent border border-primary/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Goal Progress</p>
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current: <span className="font-bold text-foreground">{sortedDesc[0]?.weight} {unit}</span></p>
              <p className="text-sm text-muted-foreground">Goal: <span className="font-bold text-primary">{settings.goal_weight} {unit}</span></p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {Math.max(0, (sortedDesc[0]?.weight - settings.goal_weight)).toFixed(1)} {unit}
              </p>
              <p className="text-xs text-muted-foreground">to go</p>
            </div>
          </div>
          {settings.starting_weight && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Start: {settings.starting_weight} {unit}</span>
                <span>Goal: {settings.goal_weight} {unit}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0,
                      ((settings.starting_weight - sortedDesc[0]?.weight) /
                      (settings.starting_weight - settings.goal_weight)) * 100
                    )).toFixed(0)}%`
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-2xl font-heading font-bold text-foreground">{latest?.weight} {unit}</p>
            <p className="text-sm text-muted-foreground">Latest weight</p>
          </div>
          {totalLost !== null && parseFloat(totalLost) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-2xl font-heading font-bold text-emerald-700">-{totalLost} {unit}</p>
              <p className="text-sm text-emerald-600">Total lost</p>
            </div>
          )}
        </div>
      )}

      {!loading && safeChartData.length >= 2 && (() => {
        // Compute cycle reference areas
        const cycleStart = settings?.cycle_start_date;
        const cycleLen = settings?.cycle_length || 28;
        const cycleAreas = [];
        if (cycleStart && showCycleWindow) {
          const today = new Date();
          let periodStart = new Date(cycleStart + "T00:00:00");
          // fast-forward to recent cycles
          while (differenceInDays(today, periodStart) > cycleLen * 3) {
            periodStart = new Date(periodStart.getTime() + cycleLen * 86400000);
          }
          for (let i = 0; i < 3; i++) {
            const s = new Date(periodStart.getTime() + i * cycleLen * 86400000);
            const e = new Date(s.getTime() + 5 * 86400000);
            cycleAreas.push({ s: format(s, "MMM d"), e: format(e, "MMM d") });
          }
        }
        return (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-heading font-semibold text-foreground">Weight Over Time ({unit})</h2>
              {settings?.cycle_start_date && (
                <button
                  onClick={() => setShowCycleWindow(v => !v)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${showCycleWindow ? "bg-pink-100 border-pink-300 text-pink-700" : "bg-muted border-border text-muted-foreground"}`}
                >
                  🩷 Period window
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={safeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} formatter={(v) => [`${v} ${unit}`, "Weight"]} />
                {cycleAreas.map((ca, i) => (
                  <ReferenceArea key={i} x1={ca.s} x2={ca.e} fill="#fbcfe8" fillOpacity={0.4} />
                ))}
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {!loading && safeChartData.length === 1 && (
        <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
          <TrendingDown className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">One more entry to unlock your chart</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Log a second weight to see your progress trend</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Log Weight Now
          </button>
        </div>
      )}

      {/* Dose-Coded Weight Chart (Pro) */}
      {!loading && (
        <DoseWeightChart weightLogs={logs} medLogs={medLogs} isPro={isPro} unit={unit} />
      )}

      {/* Estimated Medication Level Chart (Pro) */}
      {!loading && (
        <MedLevelChart medLogs={medLogs} isPro={isPro} />
      )}

      {/* Cycle Tracking */}
      {!loading && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🩷</span>
            <h2 className="text-sm font-heading font-semibold text-foreground">Cycle Tracking</h2>
            <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium ml-auto">Free</span>
          </div>
          <p className="text-xs text-muted-foreground">Track your period to see how your cycle affects weight. Shows a soft pink band on the chart above.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Period Start Date</Label>
              <Input type="date" className="rounded-xl" value={localCycleStart} onChange={e => setLocalCycleStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cycle Length (days)</Label>
              <Input type="number" className="rounded-xl" value={localCycleLen} min={21} max={45} onChange={e => setLocalCycleLen(e.target.value)} />
            </div>
          </div>
          <Button size="sm" className="w-full rounded-xl" onClick={async () => {
            setSavingCycle(true);
            if (settings) {
              await base44.entities.UserSettings.update(settings.id, {
                cycle_start_date: localCycleStart,
                cycle_length: parseInt(localCycleLen),
              });
            }
            await loadData();
            setSavingCycle(false);
            toast.success("Cycle settings saved!");
          }} disabled={savingCycle}>
            {savingCycle ? "Saving..." : "Save Cycle Settings"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="No weight logs yet"
          description="Start logging your weight to see your progress over time."
          action={<Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" />Log First Entry</Button>}
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground">Date</p>
            <p className="text-xs font-semibold text-muted-foreground">Weight</p>
          </div>
          {sortedDesc.map((log, i) => (
            <div key={log.id} className={`group px-4 py-3 ${i !== logs.length - 1 ? "border-b border-border" : ""} hover:bg-accent/30 transition-colors`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">{log.date ? format(parseISO(log.date), "MMM d") : "—"}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{log.weight} {unit}</p>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="w-6 h-6 rounded-lg hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
              {(log.waist_cm || log.hips_cm) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {log.waist_cm ? `Waist: ${log.waist_cm}cm` : ""}{log.waist_cm && log.hips_cm ? "  " : ""}{log.hips_cm ? `Hips: ${log.hips_cm}cm` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}