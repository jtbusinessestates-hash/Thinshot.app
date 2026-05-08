import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { 
  TrendingDown, Flame, Syringe, CalendarClock, 
  Plus, ChevronRight, FileText, X, CheckCircle2, Circle
} from "lucide-react";
import StatCard from "../components/StatCard";
import { useProStatus } from "@/hooks/useProStatus";
import { Button } from "@/components/ui/button";
import AIInsightsCard from "../components/AIInsightsCard";
import MilestoneShareCard from "../components/MilestoneShareCard";
import CelebrationModal from "@/components/CelebrationModal";
import { format, differenceInDays, addDays, isWithinInterval, parseISO, subDays } from "date-fns";

export default function Dashboard() {
  const { isPro, isTrial, trialDaysLeft } = useProStatus();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [weightLogs, setWeightLogs] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [sideEffectLogs, setSideEffectLogs] = useState([]);
  const [todayNutrition, setTodayNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem('thinshot_free_banner_dismissed') === '1');
  const [checklistDismissed, setChecklistDismissed] = useState(() => localStorage.getItem('thinshot_checklist_dismissed') === '1');
  const [shownMilestone, setShownMilestone] = useState(null);
  const [milestoneShownKey, setMilestoneShownKey] = useState(() => localStorage.getItem('thinshot_milestone_shown') || '');
  const [userStreak, setUserStreak] = useState(null);
  const [showRecap, setShowRecap] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const toLbs = (weight, unit) => {
    if (!weight) return 0;
    if (unit === 'kg') return weight * 2.20462;
    return weight;
  };

  function checkWeightMilestone(settings, weightLogs) {
    if (!weightLogs || weightLogs.length === 0) return null;
    const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstLbs = toLbs(sorted[0]?.weight, sorted[0]?.unit);
    const latestLbs = toLbs(sorted[sorted.length - 1]?.weight, sorted[sorted.length - 1]?.unit);
    if (!firstLbs || !latestLbs) return null;
    const lostLbs = Math.max(0, firstLbs - latestLbs);
    const milestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    for (const m of milestones) {
      if (lostLbs >= m) {
        const key = `milestone_celebrated_${m}lbs`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          return { lbs: m, emoji: '🎉', headline: `${m} lbs Down. You're doing it.`, subtext: `${m} pounds gone. That's not luck — that's you showing up every single day. 💚` };
        }
      }
    }
    return null;
  }

  function getWeekKey() {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    return `recap_dismissed_week_${start.toISOString().split('T')[0]}`;
  }

  const loadData = async () => {
    try {
      const todayDate = format(new Date(), "yyyy-MM-dd");
      const [u, ws, wl, ml, sl, streakResult, nutritionResult] = await Promise.all([
        base44.auth.me(),
        base44.entities.UserSettings.list(),
        base44.entities.WeightLog.list("-date", 30),
        base44.entities.MedicationLog.list("-injection_date", 30),
        base44.entities.SideEffectLog.list("-date", 60),
        base44.entities.UserStreak.list('-created_date', 1),
        base44.entities.NutritionLog.list("-date", 7),
      ]);
      setUser(u);
      const sortedSettings = ws?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setSettings(sortedSettings[0] || null);
      // Auto-create UserSettings with trial if none exists
      if (!sortedSettings?.[0]) {
        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const newSettings = await base44.entities.UserSettings.create({
          subscription_status: 'trial',
          is_pro: true,
          trial_end: trialEnd,
          weight_unit: 'kg',
          onboarding_complete: false,
        });
        setSettings(newSettings);
      }
      setWeightLogs(wl);
      setMedLogs(ml);
      setSideEffectLogs(sl);
      setUserStreak(streakResult[0] || null);
      const todayNutritionLog = Array.isArray(nutritionResult) ? nutritionResult.find(l => l.date === todayDate) : null;
      setTodayNutrition(todayNutritionLog || null);
      const milestone = checkWeightMilestone(sortedSettings?.[0], wl);
      if (milestone) {
        setCelebration(milestone);
        setShowCelebration(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (new Date().getDay() === 1 && !localStorage.getItem(getWeekKey())) {
      setShowRecap(true);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const { containerRef: pullRef } = usePullToRefresh(handleRefresh);

  const currentWeight = () => {
    if (weightLogs.length === 0) return null;
    const sorted = [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].weight.toFixed(1);
  };

  const streakDays = () => {
    const allDates = new Set();
    medLogs.forEach(l => {
      if (l.injection_date) allDates.add(format(new Date(l.injection_date), "yyyy-MM-dd"));
    });
    weightLogs.forEach(l => {
      if (l.date) allDates.add(l.date);
    });
    sideEffectLogs.forEach(l => {
      if (l.date) allDates.add(l.date);
    });
    if (allDates.size === 0) return 0;
    const sorted = Array.from(allDates).sort().reverse();
    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    for (const d of sorted) {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      const diff = Math.round((current - date) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        current = date;
      } else {
        break;
      }
    }
    return streak;
  };

  const nextInjection = () => {
    const injDay = settings?.injection_day;
    if (injDay) {
      const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      const targetDay = dayMap[injDay];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDay = today.getDay();
      if (todayDay === targetDay) return "Today";
      let daysUntil = (targetDay - todayDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7;
      return format(addDays(today, daysUntil), "EEE, MMM d");
    }
    if (!medLogs.length) return "Not set";
    const sorted = [...medLogs].sort((a, b) => new Date(b.injection_date) - new Date(a.injection_date));
    const last = new Date(sorted[0].injection_date);
    const drug = sorted[0]?.drug_name?.toLowerCase() || '';
    const interval = drug === 'saxenda' ? 1 : 7;
    const next = addDays(last, interval);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (next < today) return "Not set";
    return format(next, "EEE, MMM d");
  };

  const weekMeds = medLogs.filter(m => {
    const d = new Date(m.injection_date);
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    return isWithinInterval(d, { start: sevenDaysAgo, end: today });
  });

  const unit = settings?.weight_unit || "kg";
  const cw = currentWeight();

  // Maintenance mode
  const goalWeight = settings?.goal_weight;
  const cwNum = cw ? parseFloat(cw) : null;
  const inMaintenance = goalWeight && cwNum && cwNum <= goalWeight;

  // Maintenance streak — consecutive days within ±2 of goal (using any log)
  const maintenanceStreak = (() => {
    if (!inMaintenance || !goalWeight) return 0;
    const sortedW = [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let prev = new Date(); prev.setHours(0,0,0,0);
    for (const log of sortedW) {
      const diff = Math.abs(log.weight - goalWeight);
      if (diff > 2) break;
      const logDate = new Date(log.date + "T00:00:00");
      const dayDiff = differenceInDays(prev, logDate);
      if (dayDiff > 1) break;
      streak++;
      prev = logDate;
    }
    return streak;
  })();

  // Weight variance from goal over last 14 days
  const stabilityData = (() => {
    if (!goalWeight) return null;
    const recent = weightLogs.filter(l => {
      const d = new Date(l.date + "T00:00:00");
      return differenceInDays(new Date(), d) <= 14;
    });
    if (!recent.length) return null;
    const variances = recent.map(l => Math.abs(l.weight - goalWeight));
    const avg = variances.reduce((a, b) => a + b, 0) / variances.length;
    return avg.toFixed(1);
  })();

  // Milestone detection — normalized to lbs
  useEffect(() => {
    const sortedW = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstLbs = toLbs(sortedW[0]?.weight, sortedW[0]?.unit);
    const latestLbs = toLbs(sortedW[sortedW.length - 1]?.weight, sortedW[sortedW.length - 1]?.unit);
    const totalLostLbs = firstLbs && latestLbs ? Math.max(0, firstLbs - latestLbs) : 0;
    const streak = streakDays();
    const milestones = [];
    if (medLogs.length >= 1) milestones.push({ key: "first_injection", label: "First Injection Logged! 💉" });
    if (totalLostLbs >= 5)  milestones.push({ key: "lost_5", label: "5 lbs Lost! 🎉" });
    if (totalLostLbs >= 10) milestones.push({ key: "lost_10", label: "10 lbs Lost! 🔥" });
    if (totalLostLbs >= 25) milestones.push({ key: "lost_25", label: "25 lbs Lost! 🏆" });
    if (streak >= 30)    milestones.push({ key: "streak_30", label: "30-Day Streak! ⚡" });
    const newMilestone = milestones.find(m => !milestoneShownKey.includes(m.key));
    if (newMilestone) setShownMilestone(newMilestone);
  }, [weightLogs, medLogs, settings]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const loggedMedToday = medLogs.some(l => l.injection_date && format(new Date(l.injection_date), "yyyy-MM-dd") === todayStr);
  const loggedWeightToday = weightLogs.some(l => l.date === todayStr);
  const checkedInToday = sideEffectLogs.some(l => l.date === todayStr);
  const nutritionGoal = 100;

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
    <div ref={pullRef} className="space-y-8 relative overflow-y-auto">
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-spin" />
            <span className="text-xs font-medium text-foreground">Refreshing...</span>
          </div>
        </div>
      )}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="hidden lg:block text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
      {/* Free user history banner */}
      {!isPro && !bannerDismissed && user?.created_date && (() => {
        const dayX = Math.max(1, Math.ceil((new Date() - new Date(user.created_date)) / 86400000));
        return (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-emerald-800 flex-1">🌿 You're on <strong>Day {dayX}</strong> of your 14-day free history. <a href="/upgrade" className="font-semibold underline">Upgrade to Pro</a> to keep all your data forever.</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href="/upgrade" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">Upgrade Now</a>
              <button onClick={() => { setBannerDismissed(true); localStorage.setItem('thinshot_free_banner_dismissed','1'); }} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100">
                <X className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Trial Banner */}
      {(() => {
        const trialEnd = settings?.trial_end || settings?.trial_ends_at;
        const daysLeft = trialEnd ? Math.ceil((new Date(trialEnd) - new Date()) / 86400000) : null;
        const isTrialing = ['trialing','trial'].includes(settings?.subscription_status || '') && settings?.is_pro !== true;
        if (!isTrialing || !daysLeft || daysLeft > 3 || daysLeft <= 0) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-amber-800">⏰ <strong>{daysLeft} days</strong> left in your free trial</span>
            <a href="/upgrade" className="text-amber-700 font-semibold hover:underline">Upgrade →</a>
          </div>
        );
      })()}

      {/* Milestone Share Card */}
      {shownMilestone && (
        <MilestoneShareCard
          milestone={shownMilestone.label}
          startDate={settings?.created_date || weightLogs[weightLogs.length - 1]?.date}
          onClose={() => {
            const newKey = milestoneShownKey + shownMilestone.key + ",";
            localStorage.setItem('thinshot_milestone_shown', newKey);
            setMilestoneShownKey(newKey);
            setShownMilestone(null);
          }}
        />
      )}

      {/* Header */}
      <div>
        {inMaintenance ? (
          <>
            <h1 className="text-2xl font-heading font-bold text-emerald-600">Maintenance Mode 🏆</h1>
            <p className="text-muted-foreground text-sm mt-1">You've reached your goal — keep it up!</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Your GLP-1 journey at a glance 💚</p>
          </>
        )}
      </div>

      {/* Goal Progress Bar / Maintenance */}
      {(() => {
        const sw = settings?.starting_weight;
        const gw = settings?.goal_weight;
        if (!gw || !cwNum) return null;
        if (inMaintenance) {
          // Maintenance mode card
          return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-700">Weight Stability</p>
                {maintenanceStreak > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    🏅 {maintenanceStreak}-day maintenance streak
                  </span>
                )}
              </div>
              {stabilityData !== null ? (
                <p className="text-xs text-emerald-600">Avg variance from goal: <strong>{stabilityData} {unit}</strong> over last 14 days</p>
              ) : (
                <p className="text-xs text-emerald-600">Keep logging your weight to track stability.</p>
              )}
              <p className="text-xs text-emerald-500">Goal: {gw} {unit} · Current: {cwNum} {unit}</p>
            </div>
          );
        }
        if (!sw || sw <= gw) return null;
        const pct = Math.min(100, Math.max(0, ((sw - cwNum) / (sw - gw)) * 100));
        const toGo = Math.max(0, cwNum - gw).toFixed(1);
        return (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Goal Progress</p>
              <p className="text-xs font-bold text-primary">{pct.toFixed(0)}%</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "#2ECC71" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{toGo} {unit} to go · goal {gw} {unit}</p>
          </div>
        );
      })()}

      {/* Weekly Recap (Mondays only) */}
      {showRecap && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-foreground">Your Week in Review 📊</h3>
            <button onClick={() => { localStorage.setItem(getWeekKey(), 'true'); setShowRecap(false); }} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">💉 Shots this week: <span className="font-semibold">{weekMeds.length}</span></p>
            <p className="text-foreground">⚖️ Weight: <span className="font-semibold">{weightLogs.length >= 2 ? `${(weightLogs[weightLogs.length-1]?.weight - weightLogs[0]?.weight).toFixed(1)} ${unit}` : 'Not enough data'}</span></p>
            <p className="text-foreground">🔥 Streak: <span className="font-semibold">{userStreak?.current_streak ?? 0} days</span></p>
            <p className="text-muted-foreground italic text-xs mt-2">{["Every log is a step forward. You showed up this week. 💚","Progress isn't always on the scale. You're building a habit. 🌿","Consistency is your superpower. Keep going. 🔥","You tracked. That means you care. That matters. ✨","Small wins stack up. You're closer than you think. 💪"][new Date().getDate() % 5]}</p>
          </div>
          <button
            onClick={() => {
              const text = `My ThinShot Week in Review 📊\n💉 Shots: ${weekMeds.length}\n🔥 Streak: ${userStreak?.current_streak ?? 0} days\nTracked with ThinShot • thinshot.app`;
              if (navigator.share) { navigator.share({ title: 'My ThinShot Week', text }); }
              else { navigator.clipboard.writeText(text); }
            }}
            className="w-full border border-primary text-primary rounded-xl py-2 text-sm font-semibold"
          >Share This Week 📲</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
        {cw ? (
          <StatCard 
            icon={TrendingDown} 
            label="Current Weight" 
            value={`${cw} ${unit}`}
            subtext="latest measurement"
          />
        ) : (
          <Link to="/progress" className="block">
            <div className="bg-card border border-dashed border-primary/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all h-full min-h-[7rem]">
              <p className="text-4xl font-bold text-muted-foreground/30">—</p>
              <p className="text-xs text-muted-foreground font-medium text-center">No weight logged yet</p>
              <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg font-semibold">Log First Weight →</span>
            </div>
          </Link>
        )}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-foreground">{userStreak?.current_streak ?? 0}</span>
            <span className="text-sm font-semibold text-foreground">Activity Streak</span>
          </div>
          <p className="text-xs text-muted-foreground">days of consecutive logging</p>
          {(userStreak?.streak_freezes_remaining ?? 0) > 0 && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-fit mt-1">🧊 {userStreak.streak_freezes_remaining} freeze{userStreak.streak_freezes_remaining !== 1 ? 's' : ''} left</span>
          )}
        </div>
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
          subtext="based on your last injection"
          iconClass="bg-purple-100"
        />
        <Link to="/nutrition" className="col-span-2 lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Today's Protein</p>
              <span className="text-base">🥩</span>
            </div>
            {todayNutrition ? (
              <>
                <p className="text-xl font-bold text-foreground">
                  {todayNutrition.protein_g || 0}g
                  <span className="text-sm font-normal text-muted-foreground"> / {nutritionGoal}g</span>
                </p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((todayNutrition.protein_g || 0) / nutritionGoal) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Tap to log today's protein 🥩</p>
            )}
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-heading font-semibold text-foreground mb-3">Quick Log</h2>
        {!isPro ? (
          <Link to="/upgrade">
            <div className="bg-card border border-dashed border-amber-300 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Upgrade to start logging</p>
                <p className="text-xs text-muted-foreground">Start your 7-day free trial to track injections, check-ins & weight</p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </div>
          </Link>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/medications">
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Syringe className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{loggedMedToday ? "✅ Injection Logged" : "Log Injection"}</p>
                  <p className="text-xs text-muted-foreground">{loggedMedToday ? "Done for today!" : "Record your dose"}</p>
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
                  <p className="text-sm font-semibold text-foreground">{checkedInToday ? "✅ Check-in Done" : "Daily Check-in"}</p>
                  <p className="text-xs text-muted-foreground">{checkedInToday ? "Done for today!" : "Track side effects"}</p>
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
                  <p className="text-sm font-semibold text-foreground">{loggedWeightToday ? "✅ Weight Logged" : "Log Weight"}</p>
                  <p className="text-xs text-muted-foreground">{loggedWeightToday ? "Done for today!" : "Update progress"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>
          </div>
        )}
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
        isPro={isPro}
        weightLogs={weightLogs}
        medLogs={medLogs}
        settings={settings}
      />

      {/* Welcome Checklist */}
      {!checklistDismissed && (() => {
        const items = [
          { label: "Log your first injection", done: medLogs.length > 0, path: "/medications" },
          { label: "Set your injection reminder", done: !!settings?.injection_day, path: "/reminders" },
          { label: "Log your starting weight", done: weightLogs.length > 0, path: "/progress" },
          { label: "Complete your first daily check-in", done: sideEffectLogs.length > 0, path: "/side-effects" },
        ];
        const allDone = items.every(i => i.done);
        if (allDone) return null;
        return (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-heading font-semibold text-foreground">Welcome Checklist ✨</h2>
              <button onClick={() => { setChecklistDismissed(true); localStorage.setItem('thinshot_checklist_dismissed','1'); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <a key={item.label} href={item.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                  {item.done ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                  <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Doctor Share */}
      {(['active', 'trialing'].includes(settings?.subscription_status || '') || settings?.is_pro === true) ? (
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
      <CelebrationModal isOpen={showCelebration} onClose={() => setShowCelebration(false)} milestone={celebration} />
    </div>
  );
}