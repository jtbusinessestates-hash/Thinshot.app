import React from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import BackToDashboard from "@/components/BackToDashboard";

const PROMPTS = [
  "How are you feeling on your GLP-1 journey today?",
  "What's one non-scale victory you noticed this week?",
  "What did you eat today that made you feel good?",
  "What's one thing you want to do differently tomorrow?",
  "How has your energy level been this week?",
];

export default function Journal() {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    date: format(new Date(), "yyyy-MM-dd"),
    content: "",
    mood: "",
  });

  React.useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.JournalEntry.list("-date", 50);
      setEntries(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load journal entries.");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await base44.entities.JournalEntry.delete(id);
      toast.success("Entry deleted.");
      await loadEntries();
    } catch (err) {
      toast.error("Failed to delete entry.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      await base44.entities.JournalEntry.create({
        date: form.date,
        content: form.content,
        mood: form.mood || undefined,
      });
      toast.success("Journal entry saved! ✓");
      setShowForm(false);
      setForm({ date: format(new Date(), "yyyy-MM-dd"), content: "", mood: "" });
      await loadEntries();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const applyPrompt = (p) => {
    setForm(f => ({ ...f, content: p + "\n\n" }));
  };

  const MOODS = ["😊 Great", "😐 Okay", "😴 Tired", "🤢 Nauseous", "💪 Strong"];

  return (
    <div className="space-y-6">
      <BackToDashboard />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground">Your wellness diary</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">New Journal Entry</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Prompt suggestions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Need a prompt?</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPTS.slice(0, 3).map(p => (
                    <button key={p} onClick={() => applyPrompt(p)} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                      {p.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" className="rounded-xl" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Mood (optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, mood: f.mood === m ? "" : m }))}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.mood === m ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}
                      >{m}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Your entry *</Label>
                  <Textarea
                    className="rounded-xl resize-none"
                    rows={6}
                    value={form.content}
                    onChange={e => setForm({...form, content: e.target.value})}
                    placeholder="Write about your day, feelings, wins, struggles..."
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={saving || !form.content.trim()} className="flex-1 rounded-xl">
                    {saving ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Entry List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No journal entries yet. Write your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entry.mood && <span className="text-base">{entry.mood.split(" ")[0]}</span>}
                  <p className="font-semibold text-foreground text-sm">{entry.mood || "Journal Entry"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(entry.date), "MMM d, yyyy")}
                  </p>
                  <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}