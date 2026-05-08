import React from "react";
import { base44 } from "@/api/base44Client";
import { Syringe, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "../components/EmptyState";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

  React.useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await base44.entities.MedicationLog.list("-injection_date", 50);
    setLogs(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this injection?")) return;
    try {
      await base44.entities.MedicationLog.delete(id);
      await loadLogs();
    } catch (err) {
      alert("Delete failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me().catch(() => null);
    if (!user) { alert("You must be logged in to save data"); return; }
    setSaving(true);
    try {
      await base44.entities.MedicationLog.create({
        ...form,
        dose_mg: parseFloat(form.dose_mg),
        injection_date: new Date(form.injection_date).toISOString(),
      });
      setShowForm(false);
      setForm({ drug_name: "", custom_drug_name: "", dose_mg: "", injection_site: "", injection_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), notes: "" });
      await loadLogs();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Medications</h1>
          <p className="text-sm text-muted-foreground">Track your GLP-1 injection history</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Log Injection
        </Button>
      </div>

      {/* Form Modal */}
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
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      {DRUGS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
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
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
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

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState 
          icon={Syringe} 
          title="No injections logged yet" 
          description="Start tracking your GLP-1 injections to monitor your progress over time."
          action={<Button onClick={() => setShowForm(true)} className="rounded-xl gap-2"><Plus className="w-4 h-4" />Log First Injection</Button>}
        />
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
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.injection_date), "HH:mm")}
                          </p>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1 rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
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
