import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Users, TrendingUp, Crown, Activity } from "lucide-react";

export default function GrowthDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    const [allSettings, allUsers] = await Promise.all([
      base44.entities.UserSettings.list("-created_date", 1000),
      base44.entities.User.list("-created_date", 1000),
    ]);

    const pro = allSettings.filter(s => s.is_pro === true || ["active", "trialing"].includes(s.subscription_status || ""));
    const trial = allSettings.filter(s => s.subscription_status === "trial" || s.subscription_status === "trialing");
    const free = allSettings.filter(s => !s.is_pro && !["active", "trialing"].includes(s.subscription_status || ""));

    setStats({
      totalUsers: allUsers.length,
      proUsers: pro.length,
      trialUsers: trial.length,
      freeUsers: free.length,
      conversionRate: allUsers.length > 0 ? ((pro.length / allUsers.length) * 100).toFixed(1) : "0",
    });
    setLoading(false);
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Pro Users", value: stats.proUsers, icon: Crown, color: "bg-amber-100 text-amber-600" },
    { label: "Trial Users", value: stats.trialUsers, icon: Activity, color: "bg-blue-100 text-blue-600" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Growth Dashboard</h1>
        <p className="text-sm text-muted-foreground">Admin-only user & subscription metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}