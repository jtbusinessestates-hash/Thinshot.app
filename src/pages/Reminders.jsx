import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, Mail, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Reminders() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reminder_injection: true,
    reminder_checkin: true,
    injection_day: "Monday",
    reminder_time_injection: "09:00",
    reminder_time_checkin: "20:00",
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.UserSettings.list();
      const d = data?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0];
      if (d) {
        setSettings(d);
        setForm(prev => ({
          ...prev,
          reminder_injection: d.reminder_injection ?? true,
          reminder_checkin: d.reminder_checkin ?? true,
          injection_day: d.injection_day || "Monday",
          reminder_time_injection: d.reminder_time_injection || "09:00",
          reminder_time_checkin: d.reminder_time_checkin || "20:00",
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const user = await base44.auth.me().catch(() => null);
    if (!user) { toast.error("Something went wrong. Please try again."); return; }
    setSaving(true);
    try {
      if (settings) {
        await base44.entities.UserSettings.update(settings.id, {
          reminder_injection: form.reminder_injection,
          reminder_checkin: form.reminder_checkin,
          injection_day: form.injection_day,
          reminder_time_injection: form.reminder_time_injection,
          reminder_time_checkin: form.reminder_time_checkin,
        });
      } else {
        await base44.entities.UserSettings.create({
          reminder_injection: form.reminder_injection,
          reminder_checkin: form.reminder_checkin,
          injection_day: form.injection_day,
          reminder_time_injection: form.reminder_time_injection,
          reminder_time_checkin: form.reminder_time_checkin,
          weight_unit: "kg",
        });
      }
      toast.success("Reminders saved!");
      await loadSettings();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reminders</h1>
        <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
      </div>

      {/* Email Reminders Info */}
      <div className="bg-accent/50 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Email Reminders</p>
            <p className="text-sm text-muted-foreground">
              Reminders will be sent to your registered email address. Make sure to check your inbox on your scheduled days.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Injection Reminder */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Weekly Injection Reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get reminded on your injection day</p>
              </div>
            </div>
            <Switch
              checked={form.reminder_injection}
              onCheckedChange={(v) => setForm({ ...form, reminder_injection: v })}
            />
          </div>
          {form.reminder_injection && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Injection Day</Label>
                <Select value={form.injection_day} onValueChange={(v) => setForm({ ...form, injection_day: v })}>
                  <SelectTrigger className="rounded-xl max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Reminder Time
                </Label>
                <Input
                  type="time"
                  value={form.reminder_time_injection}
                  onChange={(e) => setForm({ ...form, reminder_time_injection: e.target.value })}
                  className="rounded-xl max-w-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Check-in Reminder */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Daily Check-in Reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">Daily 8pm reminder to log symptoms</p>
              </div>
            </div>
            <Switch
              checked={form.reminder_checkin}
              onCheckedChange={(v) => setForm({ ...form, reminder_checkin: v })}
            />
          </div>
          {form.reminder_checkin && (
            <div className="mt-4 pt-4 border-t border-border">
              <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Reminder Time
              </Label>
              <Input
                type="time"
                value={form.reminder_time_checkin}
                onChange={(e) => setForm({ ...form, reminder_time_checkin: e.target.value })}
                className="rounded-xl max-w-xs"
              />
            </div>
          )}
        </div>

        {/* Push Notification Info */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <BellOff className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Browser push notifications</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl"
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission().then(p => {
                  if (p === "granted") toast.success("Push notifications enabled!");
                  else toast.error("Permission denied.");
                });
              } else {
                toast.error("Push notifications not supported in this browser.");
              }
            }}
          >
            Enable Browser Notifications
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving || loading} className="w-full rounded-xl gap-2">
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}