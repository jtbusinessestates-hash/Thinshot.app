import React from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Lock, TrendingDown, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { differenceInDays, format, addDays } from "date-fns";

export default function AIInsightsCard({ isPro, weightLogs, medLogs, settings }) {
  const [insights, setInsights] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isPro && weightLogs.length >= 2) generateInsights();
  }, [isPro, weightLogs.length]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const sorted = [...weightLogs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalLost = first.weight - last.weight;
      const days = differenceInDays(new Date(last.log_date), new Date(first.log_date)) || 1;
      const weeklyRate = (totalLost / days) * 7;

      const goalWeight = settings?.goal_weight;
      const remaining = goalWeight ? last.weight - goalWeight : null;
      const predictedDays = remaining && weeklyRate > 0 ? (remaining / weeklyRate) * 7 : null;
      const predictedDate = predictedDays ? format(addDays(new Date(), predictedDays), "MMM d, yyyy") : null;

      const drug = medLogs[0]?.drug_name || "your medication";
      const unit = settings?.weight_unit || "kg";

      let tip = "Keep logging consistently — data helps identify what's working for you.";
      if (weeklyRate > 0.7) tip = `You're losing faster than average on ${drug} — great momentum, stay hydrated!`;
      else if (weeklyRate > 0.3) tip = `Steady progress on ${drug}. Consistent injections and protein-rich meals can help maintain this pace.`;
      else if (weeklyRate <= 0) tip = `Weight hasn't decreased recently. Consider logging meals or checking injection timing with your doctor.`;

      const weekTrend = weeklyRate > 0
        ? `−${weeklyRate.toFixed(2)} ${unit}/week average`
        : `No loss trend detected yet`;

      setInsights({ predictedDate, weekTrend, tip, totalLost: totalLost.toFixed(1), unit });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!isPro) {
    return (
      <div className="bg-gradient-to-r from-primary/5 to-accent rounded-2xl border border-primary/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-primary">AI Insights</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pro</span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed mb-3">
              Unlock predicted goal date, weekly trend analysis, and personalised tips based on your data.
            </p>
            <Link to="/upgrade">
              <Button size="sm" className="rounded-xl gap-2 bg-primary/90">
                <Lock className="w-3 h-3" /> Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary/5 to-accent rounded-2xl border border-primary/20 p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-accent rounded-2xl border border-primary/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-semibold text-primary">AI Insights</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Weekly Trend</p>
          </div>
          <p className="text-sm font-bold text-foreground">{insights.weekTrend}</p>
        </div>
        {insights.predictedDate && (
          <div className="bg-white/60 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Goal Date</p>
            </div>
            <p className="text-sm font-bold text-foreground">{insights.predictedDate}</p>
          </div>
        )}
        <div className="bg-white/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Lost</p>
          </div>
          <p className="text-sm font-bold text-foreground">{insights.totalLost} {insights.unit}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-white/50 rounded-xl p-3">
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80 leading-relaxed">{insights.tip}</p>
      </div>
    </div>
  );
}