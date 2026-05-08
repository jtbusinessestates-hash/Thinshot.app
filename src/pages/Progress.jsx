import React from "react";
import { base44 } from "@/api/base44Client";
import { TrendingDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmptyState from "../components/EmptyState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

export default function Progress() {
  const [logs, setLogs] = React.useState([]);
  const [settings, setSettings] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({ weight: "", waist_cm: "", hips_cm: "", log_date: format(new Date(), "yyyy-MM-dd") });

  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [wl, s] = await Promise.all([
      base44.entities.WeightLog.list("-log_date", 60),
      base44.entities.UserSettings.list("-created_date", 1),
    ]);
    setLogs(wl);
    setSettings(s[0] || null);
    setLoading(false);
  };

  const unit = settings?.weight_unit || "kg";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me().catch(() => null);
    if (!user) { alert("You must be logged in to save data"); return; }
    setSaving(true);
    try {
      await base44.entities.WeightLog.create({
        weight: parseFloat(form.weight),
        unit: unit,
        date: form.log_date,
        waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : undefined,
        hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : undefined,
        notes: form.notes || "",
      });
      setShowForm(false);
      setForm({ weight: "", waist_cm: "", hips_cm: "", log_date: format(new Date(), "yyyy-MM-dd") });
      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const chartData = [...logs]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(l => ({ date: format(parseISO(l.date), "MMM d"), weight: l.weight, waist: l.waist_cm, hips: l.hips_cm }));

  const sortedAsc = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const sortedDesc = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalLost = logs.length >= 2
    ? (sortedAsc[0].weight - sortedAsc[sortedAsc.length - 1].weight).toFixed(1)
    : null;

  const latest = sortedDesc[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground">Weight & body measurements</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Log Weight
        </Button>
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
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
                <div className="space-y-1.5">
                  <Label>Waist (cm)</Label>
                  <Input className="rounded-xl" type="number" step="0.5" value={form.waist_cm} onChange={e => setForm({ ...form, waist_cm: e.target.value })} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Hips (cm)</Label>
                  <Input className="rounded-xl" type="number" step="0.5" value={form.hips_cm} onChange={e => setForm({ ...form, hips_cm: e.target.value })} placeholder="Optional" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Date</Label>
                  <Input className="rounded-xl" type="date" value={form.log_date} onChange={e => setForm({ ...form, log_date: e.target.value })} required />
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

      {/* Summary Cards */}
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
          {latest?.waist_cm && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-2xl font-heading font-bold text-foreground">{latest.waist_cm} cm</p>
              <p className="text-sm text-muted-foreground">Waist</p>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {!loading && chartData.length >= 2 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-heading font-semibold text-foreground mb-4">Weight Over Time ({unit})</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                formatter={(v) => [`${v} ${unit}`, "Weight"]}
              />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log Table */}
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
          <div className="grid grid-cols-4 px-4 py-3 bg-secondary/50 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground">Date</p>
            <p className="text-xs font-semibold text-muted-foreground">Weight</p>
            <p className="text-xs font-semibold text-muted-foreground">Waist</p>
            <p className="text-xs font-semibold text-muted-foreground">Hips</p>
          </div>
          {[...logs].sort((a,b) => new Date(b.date)-new Date(a.date)).map((log, i) => (
            <div key={log.id} className={`grid grid-cols-4 px-4 py-3 ${i !== logs.length - 1 ? "border-b border-border" : ""}`}>
              <p className="text-sm text-foreground">{format(parseISO(log.date), "MMM d")}</p>
              <p className="text-sm font-medium text-foreground">{log.weight} {unit}</p>
              <p className="text-sm text-muted-foreground">{log.waist_cm ? `${log.waist_cm}cm` : "—"}</p>
              <p className="text-sm text-muted-foreground">{log.hips_cm ? `${log.hips_cm}cm` : "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}