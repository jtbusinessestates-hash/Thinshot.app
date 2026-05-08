import React from "react";
import { base44 } from "@/api/base44Client";
import { updateStreak } from '@/utils/streakUtils';
import { Syringe, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "../components/EmptyState";
import BackToDashboard from "../components/BackToDashboard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DRUGS = ["Ozempic", "Wegovy", "Mounjaro", "Saxenda", "Zepbound", "Custom"];
const SITES = ["Stomach", "Left Thigh", "Right Thigh", "Left Arm", "Right Arm"];

const drugColors = {
  "Ozempic": "bg-blue-100 text-blue-700 border-blue-200",
  "Wegovy": "bg-teal-100 text-teal-700 border-teal-200",
  "Mounjaro": "bg-purple-100 text-purple-700 border-purple-200",
  "Saxenda": "bg-orange-100 text-orange-700 border-orange-200",
  "Zepbound": "bg-pink-100 text-pink-700 border-pink-200",
  "Custom": "bg-gray-100 text-gray-700 border-gray-200",
};

export default function Medications() {
  const [logs, setLogs] = React.useState([]);
  const [pendingDeleteId, setPendingDeleteId] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    drug_name: "",
    custom_drug_name: "",
    dose_mg: "",
    injection_site: "",
    injection_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: "",
  });

  React.useEffect(() => {
    // One-time cleanup: delete known test injection records from April 18
    const cleanTestData = async () => {
      const JUNK_IDS = [
        "69e388e895b44d6b747eb772","69e388fba2bf2956b00b0114","69e38cc265e9452e65f51a91",
        "69e3a2566ff577d4150ba26f","69e3a328848607438f988116","69e3a3ae8eb2d86c74f929fa",
        "69e3a3c462297ce9945a6db4","69e3a48a711a77ccc493a71b","69e3a89d59622e98a929b295",
        "69e3aa30ff4a4ef81eb503b0","69e3aa3b67ae7cb65674fcb1","69e3acc4a57b7d3f542a1417",
        "69e3babe809bdec9ef8b9c15",
      ];
      for (const id of JUNK_IDS) {
        try { await base44.entities.MedicationLog.delete(id); } catch(e) {}
      }
    };
    cleanTestData();
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.MedicationLog.list("-injection_date", 50);
      setLogs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load injections.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me().catch(() => null);
    if (!user) { alert("You must be logged in to save data"); return; }
    setSaving(true);
    // Over-dose warning
    const submitDate = format(new Date(form.injection_date), "yyyy-MM-dd");
    const sameDay = logs.filter(l => format(new Date(l.injection_date), "yyyy-MM-dd") === submitDate);
    if (sameDay.length >= 3) {
      const confirmed = window.confirm(
        "⚠️ You've already logged " + sameDay.length + " injection(s) on this date.\n\nAre you sure? Most GLP-1 medications are weekly. This is more than the recommended dose frequency."
      );
      if (!confirmed) {
        setSaving(false);
        return;
      }
    }
    try {
      await base44.entities.MedicationLog.create({
        ...form,
        dose_mg: parseFloat(form.dose_mg),
        injection_date: new Date(form.injection_date).toISOString(),
      });
      await updateStreak();
      toast.success("Injection logged! 💉");
      setShowForm(false);
      setForm({ drug_name: "", custom_drug_name: "", dose_mg: "", injection_site: "", injection_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), notes: "" });
      await loadLogs();
    } catch (err) {
      console.error("Failed to log injection:", err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setTimeout(() => setPendingDeleteId(null), 3000);
      return;
    }
    setPendingDeleteId(null);
    try {
      await base44.entities.MedicationLog.delete(id);
      toast.success("Injection deleted");
      await loadLogs();
    } catch (err) {
      toast.error("Delete failed. Try again.");
    }
  };

  const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
      const d = format(new Date(log.injection_date), "yyyy-MM-dd");
      if (!groups[d]) groups[d] = [];
      groups[d].push(log);
    });
    return groups;
  };

  const grouped = groupByDate(logs);

  const [user, setUser] = React.useState(null);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <BackToDashboard />
      {user?.role === "admin" && (
        <button
          className="text-xs text-destructive border border-destructive/30 rounded-xl px-3 py-2 hover:bg-destructive/10 transition-colors"
          onClick={async () => {
            if (!window.confirm("Delete all injection logs from April 17, 2026?")) return;
            const all = await base44.entities.MedicationLog.list("-injection_date", 200);
            const testLogs = all.filter(l => l.injection_date && l.injection_date.startsWith("2026-04-17"));
            await Promise.all(testLogs.map(l => base44.entities.MedicationLog.delete(l.id)));
            window.alert("Deleted " + testLogs.length + " test entries.");
            await loadLogs();
          }}
        >🗑 Clear April 17 Test Data</button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Medications</h1>
          <p className="text-sm text-muted-foreground">Track your GLP-1 injection history</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Log Injection
        </Button>
      </div>

      {logs.length >= 2 && (() => {
        const lastThree = [...logs]
          .sort((a, b) => new Date(b.injection_date) - new Date(a.injection_date))
          .slice(0, 3)
          .map(l => l.injection_site)
          .filter(Boolean);
        const sameAsPrevious = lastThree.length >= 2 && lastThree[0] === lastThree[1];
        return (
          <div className={`rounded-2xl p-4 border ${sameAsPrevious ? 'bg-amber-50 border-amber-200' : 'bg-card border-border'}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Injection Sites</p>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {lastThree.map((site, i) => (
                <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  i === 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {i === 0 ? '📍 ' : ''}{site}
                </span>
              ))}
            </div>
            {sameAsPrevious ? (
              <p className="text-xs text-amber-700 font-medium">
                💉 Tip: You used {lastThree[0]} last time too. Rotating sites improves absorption and prevents buildup.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Good rotation! Keep alternating sites for best absorption.</p>
            )}
          </div>
        );
      })()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Log Injection</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label>Medication</Label>
                  <Select value={form.drug_name} onValueChange={(v) => setForm({ ...form, drug_name: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select drug" /></SelectTrigger>
                    <SelectContent>{DRUGS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {form.drug_name === "Custom" && (
                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <Label>Custom Name</Label>
                    <Input className="rounded-xl" value={form.custom_drug_name} onChange={e => setForm({ ...form, custom_drug_name: e.target.value })} placeholder="Drug name" required />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Dose (mg)</Label>
                  <Input className="rounded-xl" type="number" step="0.1" value={form.dose_mg} onChange={e => setForm({ ...form, dose_mg: e.target.value })} placeholder="e.g. 0.5" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Injection Site</Label>
                  <Select value={form.injection_site} onValueChange={(v) => setForm({ ...form, injection_site: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select site" /></SelectTrigger>
                    <SelectContent>{SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Date & Time</Label>
                  <Input className="rounded-xl" type="datetime-local" value={form.injection_date} onChange={e => setForm({ ...form, injection_date: e.target.value })} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Input className="rounded-xl" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={saving || !form.drug_name || !form.dose_mg || !form.injection_site} className="flex-1 rounded-xl">
                  {saving ? "Saving..." : "Save Injection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Syringe} title="No injections logged yet" description="Start tracking your GLP-1 injections to monitor your progress over time."
          action={<Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" />Log First Injection</Button>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, dayLogs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </p>
              <div className="relative pl-5 space-y-2">
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                {dayLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-3.5 top-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-card border border-border rounded-xl p-4 ml-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", drugColors[log.drug_name] || drugColors["Custom"])}>
                              {log.drug_name === "Custom" ? log.custom_drug_name : log.drug_name}
                            </span>
                            <span className="text-xs text-muted-foreground">{log.dose_mg}mg</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">{log.injection_site}</p>
                          {log.notes && <p className="text-xs text-foreground/70 mt-1 italic">"{log.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-xs text-muted-foreground">{format(new Date(log.injection_date), "HH:mm")}</p>
                          <button
                            type="button"
                            onClick={() => handleDelete(log.id)}
                            className={"p-1 rounded transition-colors " + (pendingDeleteId === log.id ? "bg-destructive/10" : "")}
                          >
                            {pendingDeleteId === log.id
                              ? <span className="text-xs text-destructive font-semibold px-1">Confirm delete?</span>
                              : <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                            }
                          </button>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}