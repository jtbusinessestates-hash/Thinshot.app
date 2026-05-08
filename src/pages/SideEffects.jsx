import React from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { updateStreak } from '@/utils/streakUtils';
import { Heart, Plus, CheckCircle2, Trash2 } from "lucide-react";

import SideEffectInsight from "../components/SideEffectInsight";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RatingInput from "../components/RatingInput";
import EmptyState from "../components/EmptyState";
import BackToDashboard from "../components/BackToDashboard";
import { format, isToday, parseISO } from "date-fns";

const EMOJI_MAP = { 1: "😊", 2: "🙂", 3: "😐", 4: "😟", 5: "😣" };
const MOOD_EMOJI = { 1: "😔", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

export default function SideEffects() {
  const [logs, setLogs] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [checkedToday, setCheckedToday] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState(null);
  const [currentDrug, setCurrentDrug] = React.useState(null);
  const [weekNumber, setWeekNumber] = React.useState(null);
  const [form, setForm] = React.useState({ nausea: 0, fatigue: 0, appetite: 0, mood: 0, hunger: 5, notes: "" });

  React.useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [data, medLogs] = await Promise.all([
        base44.entities.SideEffectLog.list("-date", 30),
        base44.entities.MedicationLog.list("-injection_date", 50),
      ]);
      setLogs(data);
      const todayLog = data.find(l => isToday(parseISO(l.date)));
      setCheckedToday(!!todayLog);
      if (medLogs.length) {
        const drug = medLogs[0];
        setCurrentDrug(drug.drug_name === "Custom" ? drug.custom_drug_name : drug.drug_name);
        const sorted = [...medLogs].sort((a, b) => new Date(a.injection_date) - new Date(b.injection_date));
        const first = new Date(sorted[0].injection_date);
        const wk = Math.floor((Date.now() - first.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        setWeekNumber(wk);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load check-ins.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.nausea === 0 || form.fatigue === 0 || form.appetite === 0 || form.mood === 0) {
      alert("Please rate all four fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const all = await base44.entities.SideEffectLog.list("-date", 30);
      const existing = all.find(r => r.date === today);
      let saved;
      if (existing) {
        saved = await base44.entities.SideEffectLog.update(existing.id, { ...form, date: today });
      } else {
        saved = await base44.entities.SideEffectLog.create({ ...form, date: today });
      }
      await updateStreak();
      toast.success("Check-in saved! ✓");
      setLastSaved(saved);
      setShowForm(false);
      setForm({ nausea: 0, fatigue: 0, appetite: 0, mood: 0, hunger: 5, notes: "" });
      await loadLogs();
    } catch (err) {
      console.error("Failed to save check-in:", err);
      toast.error("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!logId) { console.error("No record ID to delete"); return; }
    // delete confirmed by user action
    try {
      await base44.entities.SideEffectLog.delete(logId);
      toast.success("Deleted successfully");
      await loadLogs();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete. Please try again.");
    }
  };

  const avgScore = (log) => ((log.nausea + log.fatigue + log.appetite + log.mood) / 4).toFixed(1);

  return (
    <div className="space-y-6">
      <BackToDashboard />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Side Effects</h1>
          <p className="text-sm text-muted-foreground">Daily symptom check-in</p>
        </div>
        {!checkedToday && (
          <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Check-in
          </Button>
        )}
      </div>

      {checkedToday && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Today's check-in complete!</p>
            <p className="text-xs text-emerald-600">Come back tomorrow to log again.</p>
          </div>
        </div>
      )}

      {lastSaved && (
        <SideEffectInsight log={lastSaved} drugName={currentDrug} weekNumber={weekNumber} />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Daily Check-in</h2>
              <span className="text-sm text-muted-foreground">{format(new Date(), "MMM d, yyyy")}</span>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <RatingInput label="Nausea" value={form.nausea} onChange={(v) => setForm({ ...form, nausea: v })} />
              <RatingInput label="Fatigue" value={form.fatigue} onChange={(v) => setForm({ ...form, fatigue: v })} />
              <RatingInput label="Appetite" value={form.appetite} onChange={(v) => setForm({ ...form, appetite: v })} />
              <RatingInput label="Mood" value={form.mood} onChange={(v) => setForm({ ...form, mood: v })} isMood />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Hunger Level</label>
                  <span className="text-sm font-semibold text-primary">{form.hunger}/10</span>
                </div>
                <p className="text-xs text-muted-foreground">1 = no appetite · 10 = very hungry</p>
                <Slider min={1} max={10} step={1} value={[form.hunger]} onValueChange={([v]) => setForm({ ...form, hunger: v })} className="py-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="How are you feeling today? Any specific symptoms?"
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button
                  type="submit"
                  disabled={saving || form.nausea === 0 || form.fatigue === 0 || form.appetite === 0 || form.mood === 0}
                  className="flex-1 rounded-xl"
                >
                  {saving ? "Saving..." : "Save Check-in"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No check-ins yet"
          description="Start your daily symptom tracking to identify patterns over time."
          action={<Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" />First Check-in</Button>}
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  {isToday(parseISO(log.date)) ? "Today" : format(parseISO(log.date), "EEEE, MMM d")}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full font-medium">
                    Avg: {avgScore(log)}/5
                  </span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="w-6 h-6 rounded-lg hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Nausea", val: log.nausea, emoji: EMOJI_MAP },
                  { label: "Fatigue", val: log.fatigue, emoji: EMOJI_MAP },
                  { label: "Appetite", val: log.appetite, emoji: EMOJI_MAP },
                  { label: "Mood", val: log.mood, emoji: MOOD_EMOJI },
                ].map(({ label, val, emoji }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg">{emoji[val]}</p>
                    <p className="text-sm font-bold text-foreground">{val}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              {log.notes && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border italic">"{log.notes}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}