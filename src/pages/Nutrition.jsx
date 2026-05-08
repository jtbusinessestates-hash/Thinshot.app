import React from "react";
import { base44 } from "@/api/base44Client";
import { Utensils, Plus, Minus, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import BackToDashboard from "@/components/BackToDashboard";

export default function Nutrition() {
  const [todayLog, setTodayLog] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [waterSaving, setWaterSaving] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [form, setForm] = React.useState({
    protein_g: "", calories: "", carbs_g: "", fat_g: "", fiber_g: "", notes: ""
  });
  const [water, setWater] = React.useState(0);

  React.useEffect(() => {
    // One-time cleanup: delete duplicate water logs from May 7
    const cleanDupeWater = async () => {
      const DUPE_WATER_IDS = [
        "69fcac9ee97de4c4acfbffd1",
        "69fcac8e099013f285a727d6",
        "69fcac8e19570fa6507df14b",
        "69fcac8c34430ab939d16388",
        "69fcac8b1735828db62c769f",
        "69fcac8ac07db893cfd078ee",
        "69fcac89c01c7101c57ec040",
      ];
      for (const id of DUPE_WATER_IDS) {
        try { await base44.entities.NutritionLog.delete(id); } catch(e) {}
      }
    };
    cleanDupeWater();
  }, []);

  React.useEffect(() => { loadForDate(selectedDate); }, [selectedDate]);

  const loadForDate = async (date) => {
    setLoading(true);
    try {
      const all = await base44.entities.NutritionLog.list("-date", 60);
      const existing = all.find(r => r.date === date);
      if (existing) {
        setTodayLog(existing);
        setForm({
          protein_g: existing.protein_g?.toString() || "",
          calories: existing.calories?.toString() || "",
          carbs_g: existing.carbs_g?.toString() || "",
          fat_g: existing.fat_g?.toString() || "",
          fiber_g: existing.fiber_g?.toString() || "",
          notes: existing.notes || "",
        });
        setWater(existing.water_glasses || existing.water_glasses || 0);
      } else {
        setTodayLog(null);
        setForm({ protein_g: "", calories: "", carbs_g: "", fat_g: "", fiber_g: "", notes: "" });
        setWater(0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load nutrition data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        protein_g: form.protein_g ? parseFloat(form.protein_g) : undefined,
        calories: form.calories ? parseInt(form.calories) : undefined,
        carbs_g: form.carbs_g ? parseFloat(form.carbs_g) : undefined,
        fat_g: form.fat_g ? parseFloat(form.fat_g) : undefined,
        fiber_g: form.fiber_g ? parseFloat(form.fiber_g) : undefined,
        water_glasses: water,
        notes: form.notes || undefined,
      };
      if (todayLog) {
        await base44.entities.NutritionLog.update(todayLog.id, payload);
      } else {
        await base44.entities.NutritionLog.create(payload);
      }
      toast.success("Nutrition logged! ✓");
      await loadForDate(selectedDate);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateWater = async (newCount) => {
    const clamped = Math.max(0, Math.min(20, newCount));
    setWater(clamped);
    setWaterSaving(true);
    try {
      const payload = { date: selectedDate, water_glasses: clamped };
      if (todayLog) {
        await base44.entities.NutritionLog.update(todayLog.id, payload);
        setTodayLog({ ...todayLog, water_glasses: clamped });
      } else {
        const created = await base44.entities.NutritionLog.create(payload);
        setTodayLog(created);
      }
      if (clamped === 8) toast.success("🎉 Hydration goal reached! 8 glasses today.");
    } catch (err) {
      console.error("Water save failed:", err);
      toast.error("Failed to save water count.");
      setWater(todayLog?.water_glasses || todayLog?.water_glasses || 0);
    } finally {
      setWaterSaving(false);
    }
  };

  const protein = parseFloat(form.protein_g) || todayLog?.protein_g || 0;
  const calories = parseInt(form.calories) || todayLog?.calories || 0;
  const carbs = parseFloat(form.carbs_g) || todayLog?.carbs_g || 0;
  const fat = parseFloat(form.fat_g) || todayLog?.fat_g || 0;

  return (
    <div className="space-y-6">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Nutrition</h1>
        <p className="text-sm text-muted-foreground">Daily macro & hydration tracking</p>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground flex-shrink-0">Date:</Label>
        <Input
          type="date"
          className="rounded-xl max-w-xs"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Macro Summary */}
      {(protein > 0 || calories > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{calories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-rose-500">{fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
      )}

      {/* Water Counter */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">Water Intake</p>
              <p className="text-xs text-muted-foreground">Goal: 8 glasses</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600">{water}/8</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl w-12 h-12"
            onClick={() => updateWater(water - 1)}
            disabled={water === 0 || waterSaving}
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all ${i < water ? "bg-blue-500" : "bg-muted"}`}
              />
            ))}
          </div>
          <Button
            size="icon"
            className="rounded-xl w-12 h-12"
            onClick={() => updateWater(water + 1)}
            disabled={water >= 20 || waterSaving}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        {water >= 8 && (
          <p className="text-xs text-blue-600 font-medium mt-2 text-center">💧 Daily goal reached!</p>
        )}
      </div>

      {/* Macro Form */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          {loading ? "Loading..." : todayLog ? "Update Today's Macros" : "Log Today's Macros"}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Protein (g)</Label>
              <Input type="number" step="1" className="rounded-xl" value={form.protein_g} onChange={e => setForm({...form, protein_g: e.target.value})} placeholder="e.g. 120" />
            </div>
            <div className="space-y-1.5">
              <Label>Calories</Label>
              <Input type="number" step="1" className="rounded-xl" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} placeholder="e.g. 1600" />
            </div>
            <div className="space-y-1.5">
              <Label>Carbs (g)</Label>
              <Input type="number" step="1" className="rounded-xl" value={form.carbs_g} onChange={e => setForm({...form, carbs_g: e.target.value})} placeholder="e.g. 150" />
            </div>
            <div className="space-y-1.5">
              <Label>Fat (g)</Label>
              <Input type="number" step="1" className="rounded-xl" value={form.fat_g} onChange={e => setForm({...form, fat_g: e.target.value})} placeholder="e.g. 60" />
            </div>
            <div className="space-y-1.5">
              <Label>Fiber (g)</Label>
              <Input type="number" step="1" className="rounded-xl" value={form.fiber_g} onChange={e => setForm({...form, fiber_g: e.target.value})} placeholder="Optional" />
            </div>
          </div>
          <Button type="submit" disabled={saving || loading} className="w-full rounded-xl">
            {saving ? "Saving..." : todayLog ? "Update Macros" : "Save Macros"}
          </Button>
        </form>
      </div>
    </div>
  );
}