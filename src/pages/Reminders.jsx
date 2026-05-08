import React from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, Mail, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Reminders() {
  const [settings, setSettings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    reminder_injection: true,
    reminder_checkin: true,
    injection_day: "Monday",
    reminder_email: "",
  });

  React.useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await base44.entities.UserSettings.list("-created_date", 1);
    if (data[0]) {
      setSettings(data[0]);
      setForm(prev => ({
        ...prev,
        reminder_injection: data[0].reminder_injection ?? true,
        reminder_checkin: data[0].reminder_checkin ?? true,
        injection_day: data[0].injection_day || "Monday",
      }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const user = await base44.auth.me().catch(() => null);
    if (!user) { alert("You must be logged in to save data"); return; }
    setSaving(true);
    try {
      if (settings) {
        await base44.entities.UserSettings.update(settings.id, {
          reminder_injection: form.reminder_injection,
          reminder_checkin: form.reminder_checkin,
          injection_day: form.injection_day,
        });
      } else {
        await base44.entities.UserSettings.create({
          reminder_injection: form.reminder_injection,
          reminder_checkin: form.reminder_checkin,
          injection_day: form.injection_day,
          weight_unit: "kg",
        });
      }
      toast.success("Reminders saved!");
      await loadSettings();
    } catch (err) {
      alert("Error: " + err.message);
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
            <div className="mt-4 pt-4 border-t border-border">
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