import { differenceInDays, differenceInCalendarMonths, parseISO } from "date-fns";

const BADGES = [
  {
    id: "first_injection",
    emoji: "💉",
    title: "First Shot",
    desc: "Logged your first injection",
    check: ({ medLogs }) => medLogs.length >= 1,
  },
  {
    id: "streak_7",
    emoji: "🔥",
    title: "7-Day Streak",
    desc: "7 consecutive check-in days",
    check: ({ streak }) => streak >= 7,
  },
  {
    id: "streak_30",
    emoji: "🏆",
    title: "30-Day Streak",
    desc: "30 consecutive check-in days",
    check: ({ streak }) => streak >= 30,
  },
  {
    id: "lost_5kg",
    emoji: "⚖️",
    title: "5kg Down",
    desc: "Lost 5kg since starting",
    check: ({ weightLostKg }) => weightLostKg >= 5,
  },
  {
    id: "lost_10kg",
    emoji: "🌟",
    title: "10kg Down",
    desc: "Lost 10kg since starting",
    check: ({ weightLostKg }) => weightLostKg >= 10,
  },
  {
    id: "3_months",
    emoji: "🎖️",
    title: "3 Months Strong",
    desc: "3 months on medication",
    check: ({ medLogs }) => {
      if (!medLogs.length) return false;
      const sorted = [...medLogs].sort((a, b) => new Date(a.injection_date) - new Date(b.injection_date));
      return differenceInCalendarMonths(new Date(), new Date(sorted[0].injection_date)) >= 3;
    },
  },
];

function calcWeightLostKg(weightLogs, unit) {
  if (weightLogs.length < 2) return 0;
  const sorted = [...weightLogs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const diff = sorted[0].weight - sorted[sorted.length - 1].weight;
  return unit === "lbs" ? diff * 0.453592 : diff;
}

function calcStreak(sideEffectLogs) {
  if (!sideEffectLogs.length) return 0;
  const dates = [...new Set(sideEffectLogs.map(l => l.log_date))].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (let d of dates) {
    const date = parseISO(d);
    const diff = differenceInDays(current, date);
    if (diff <= 1) { streak++; current = date; }
    else break;
  }
  return streak;
}

export default function MilestoneBadges({ medLogs, weightLogs, sideEffectLogs, settings }) {
  const unit = settings?.weight_unit || "kg";
  const weightLostKg = calcWeightLostKg(weightLogs, unit);
  const streak = calcStreak(sideEffectLogs);
  const ctx = { medLogs, weightLogs, sideEffectLogs, weightLostKg, streak };

  const earned = BADGES.filter(b => b.check(ctx));
  const locked = BADGES.filter(b => !b.check(ctx));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h2 className="font-heading font-semibold text-sm text-foreground mb-4">Milestone Badges</h2>
      {earned.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Earned ({earned.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {earned.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl shadow-sm">
                  {b.emoji}
                </div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{b.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {locked.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Locked ({locked.length})</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {locked.map(b => (
              <div key={b.id} className="flex flex-col items-center gap-1.5 text-center opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-muted flex items-center justify-center text-2xl grayscale">
                  {b.emoji}
                </div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{b.title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}