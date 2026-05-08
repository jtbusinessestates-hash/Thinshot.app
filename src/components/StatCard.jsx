import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, subtext, className, iconClass }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-5 transition-all hover:shadow-md", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconClass || "bg-primary/10")}>
          <Icon className={cn("w-5 h-5", iconClass ? "text-white" : "text-primary")} />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      {subtext && <p className="text-xs text-muted-foreground/70 mt-1">{subtext}</p>}
    </div>
  );
}