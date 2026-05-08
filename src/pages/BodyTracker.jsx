import React from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import BackToDashboard from "@/components/BackToDashboard";

export default function BodyTracker() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "", unit: "lbs",
    waist_in: "", hips_in: "", chest_in: "",
    left_arm_in: "", right_arm_in: "",
    left_thigh_in: "", right_thigh_in: "",
    body_fat_pct: "", muscle_mass_pct: "", notes: ""
  });

  React.useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.BodyMeasurementLog.list("-date", 60);
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load measurements.");
    } finally {
      setLoading(false);
    }
  };

  const parseNum = (v) => v !== "" && v !== undefined ? parseFloat(v) : undefined;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const all = await base44.entities.BodyMeasurementLog.list("-date", 100);
      const existing = all.find(r => r.date === form.date);
      const payload = {
        date: form.date,
        weight: parseNum(form.weight),
        unit: form.unit,
        waist_in: parseNum(form.waist_in),
        hips_in: parseNum(form.hips_in),
        chest_in: parseNum(form.chest_in),
        left_arm_in: parseNum(form.left_arm_in),
        right_arm_in: parseNum(form.right_arm_in),
        left_thigh_in: parseNum(form.left_thigh_in),
        right_thigh_in: parseNum(form.right_thigh_in),
        body_fat_pct: parseNum(form.body_fat_pct),
        muscle_mass_pct: parseNum(form.muscle_mass_pct),
        notes: form.notes || undefined,
      };
      if (existing) {
        await base44.entities.BodyMeasurementLog.update(existing.id, payload);
      } else {
        await base44.entities.BodyMeasurementLog.create(payload);
      }
      toast.success("Measurements saved! ✓");
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), weight: "", unit: "lbs", waist_in: "", hips_in: "", chest_in: "", left_arm_in: "", right_arm_in: "", left_thigh_in: "", right_thigh_in: "", body_fat_pct: "", muscle_mass_pct: "", notes: "" });
      await loadLogs();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save measurements. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // delete confirmed by user action
    try {
      await base44.entities.BodyMeasurementLog.delete(id);
      toast.success("Entry deleted.");
      await loadLogs();
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const sortedAsc = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sortedAsc[sortedAsc.length - 1];
  const first = sortedAsc[0];

  const chartData = sortedAsc.map(l => ({
    date: format(parseISO(l.date), "MMM d"),
    waist: l.waist_in,
    hips: l.hips_in,
    weight: l.weight,
  }));

  return (
    <div className="space-y-6">
      <BackToDashboard />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Body Tracker</h1>
          <p className="text-sm text-muted-foreground">Track measurements & body composition</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Log Measurements
        </Button>
      </div>

      {/* Progress Summary */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {latest?.waist_in && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xl font-bold text-foreground">{latest.waist_in}"</p>
              <p className="text-xs text-muted-foreground">Waist</p>
              {first?.waist_in && latest.waist_in !== first.waist_in && (
                <p className="text-xs text-emerald-600 mt-1">
                  {(first.waist_in - latest.waist_in).toFixed(1)}" lost
                </p>
              )}
            </div>
          )}
          {latest?.hips_in && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xl font-bold text-foreground">{latest.hips_in}"</p>
              <p className="text-xs text-muted-foreground">Hips</p>
            </div>
          )}
          {latest?.body_fat_pct && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xl font-bold text-foreground">{latest.body_fat_pct}%</p>
              <p className="text-xs text-muted-foreground">Body Fat</p>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Waist Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="waist" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Waist (in)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Log Measurements</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" className="rounded-xl" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Waist (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.waist_in} onChange={e => setForm({...form, waist_in: e.target.value})} placeholder="e.g. 32.5" />
                </div>
                <div className="space-y-1.5">
                  <Label>Hips (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.hips_in} onChange={e => setForm({...form, hips_in: e.target.value})} placeholder="e.g. 40.0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Chest (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.chest_in} onChange={e => setForm({...form, chest_in: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Left Arm (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.left_arm_in} onChange={e => setForm({...form, left_arm_in: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Right Arm (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.right_arm_in} onChange={e => setForm({...form, right_arm_in: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Left Thigh (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.left_thigh_in} onChange={e => setForm({...form, left_thigh_in: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Right Thigh (inches)</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.right_thigh_in} onChange={e => setForm({...form, right_thigh_in: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Body Fat %</Label>
                  <Input type="number" step="0.1" className="rounded-xl" value={form.body_fat_pct} onChange={e => setForm({...form, body_fat_pct: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 rounded-xl">
                  {saving ? "Saving..." : "Save Measurements"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log History */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No measurements yet. Log your first entry above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Log History</h2>
          {[...logs].sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
            <div key={log.id} className="bg-card border border-border rounded-xl p-4 group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{format(parseISO(log.date), "MMMM d, yyyy")}</p>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:underline transition-opacity"
                >Delete</button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                {log.waist_in && <span>Waist: {log.waist_in}"</span>}
                {log.hips_in && <span>Hips: {log.hips_in}"</span>}
                {log.chest_in && <span>Chest: {log.chest_in}"</span>}
                {log.left_arm_in && <span>L.Arm: {log.left_arm_in}"</span>}
                {log.right_arm_in && <span>R.Arm: {log.right_arm_in}"</span>}
                {log.body_fat_pct && <span>Body Fat: {log.body_fat_pct}%</span>}
                {log.weight && <span>Weight: {log.weight} {log.unit || "lbs"}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}