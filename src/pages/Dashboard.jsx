import React from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { 
  TrendingDown, Flame, Syringe, CalendarClock, 
  Plus, ChevronRight, FileText
} from "lucide-react";
import StatCard from "../components/StatCard";
import { Button } from "@/components/ui/button";
import AIInsightsCard from "../components/AIInsightsCard";
import MilestoneBadges from "../components/MilestoneBadges";
import { format, differenceInDays, addDays, isWithinInterval, startOfWeek, endOfWeek, parseISO, subDays } from "date-fns";

export default function Dashboard() {
  const [user, setUser] = React.useState(null);
  const [settings, setSettings] = React.useState(null);
  const [weightLogs, setWeightLogs] = React.useState([]);
  const [medLogs, setMedLogs] = React.useState([]);
  const [sideEffectLogs, setSideEffectLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [u, ws, wl, ml, sl] = await Promise.all([
          base44.auth.me(),
          base44.entities.UserSettings.list("-created_date", 1),
          base44.entities.WeightLog.list("-log_date", 30),
          base44.entities.MedicationLog.list("-injection_date", 30),
          base44.entities.SideEffectLog.list("-log_date", 60),
        ]);
        setUser(u);
        setSettings(ws[0] || null);
        setWeightLogs(wl);
        setMedLogs(ml);
        setSideEffectLogs(sl);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const weightLost = () => {
    if (weightLogs.length < 2) return null;
    const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const diff = sorted[0].weight - sorted[sorted.length - 1].weight;
    return diff > 0 ? diff.toFixed(1) : "0.0";
  };

  const streakDays = () => {
    if (!sideEffectLogs.length) return 0;
    const dates = sideEffectLogs.map(l => l.date).sort().reverse();
    let streak = 0;
    let current = new Date();
    for (let d of dates) {
      const diff = differenceInDays(current, new Date(d));
      if (diff <= 1) { streak++; current = new Date(d); }
      else break;
    }
    return streak;
  };

  const nextInjection = () => {
    if (!medLogs.length) return "Not set";
    const sorted = [...medLogs].sort((a, b) => new Date(b.injection_date) - new Date(a.injection_date));
    const last = new Date(sorted[0].injection_date);
    const next = addDays(last, 7);
    return format(next, "EEE, MMM d");
  };

  const weekMeds = medLogs.filter(m => {
    const d = new Date(m.injection_date);
    return isWithinInterval(d, { start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
  });

  const unit = settings?.weight_unit || "kg";
  const wl = weightLost();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your weekly summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={TrendingDown} 
          label="Weight Lost" 
          value={wl ? `${wl} ${unit}` : "—"} 
          subtext="since start"
        />
        <StatCard 
          icon={Flame} 
          label="Day Streak" 
          value={`${streakDays()}d`}
          subtext="check-ins logged"
          iconClass="bg-orange-100"
        />
        <StatCard 
          icon={Syringe} 
          label="This Week" 
          value={`${weekMeds.length} inj.`}
          subtext="medication doses"
          iconClass="bg-blue-100"
        />
        <StatCard 
          icon={CalendarClock} 
          label="Next Dose" 
          value={nextInjection()}
          subtext="estimated"
          iconClass="bg-purple-100"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-heading font-semibold text-foreground mb-3">Quick Log</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/medications">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Syringe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Log Injection</p>
                <p className="text-xs text-muted-foreground">Record your dose</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
          <Link to="/side-effects">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                <Plus className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Daily Check-in</p>
                <p className="text-xs text-muted-foreground">Track side effects</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-rose-400 transition-colors" />
            </div>
          </Link>
          <Link to="/progress">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Log Weight</p>
                <p className="text-xs text-muted-foreground">Update progress</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-heading font-semibold text-foreground">Recent Injections</h2>
          <Link to="/medications" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </div>
        {medLogs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No injections logged yet.</p>
            <Link to="/medications">
              <Button size="sm" className="mt-3 rounded-xl">Log first injection</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {medLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {log.drug_name === "Custom" ? log.custom_drug_name : log.drug_name} — {log.dose_mg}mg
                  </p>
                  <p className="text-xs text-muted-foreground">{log.injection_site}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(log.injection_date), "MMM d")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <AIInsightsCard
        isPro={settings?.is_pro === true}
        weightLogs={weightLogs}
        medLogs={medLogs}
        settings={settings}
      />

      {/* Milestone Badges */}
      <MilestoneBadges
        medLogs={medLogs}
        weightLogs={weightLogs}
        sideEffectLogs={sideEffectLogs}
        settings={settings}
      />

      {/* Doctor Share */}
      {settings?.is_pro === true ? (
        <Link to="/doctor-report" target="_blank">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Share with Doctor</p>
              <p className="text-xs text-muted-foreground">90-day printable report</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>
      ) : (
        <Link to="/upgrade">
          <div className="bg-card border border-dashed border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all group cursor-pointer opacity-70">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Share with Doctor</p>
              <p className="text-xs text-muted-foreground">90-day printable report</p>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>
          </div>
        </Link>
      )}
    </div>
  );
}