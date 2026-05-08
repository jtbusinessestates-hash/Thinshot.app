import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Syringe, TrendingUp, Settings, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/medications", label: "Log", icon: Syringe },
  { path: "/progress", label: "Progress", icon: TrendingUp },
  { path: "/photos", label: "Photos", icon: Camera },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center">
        {items.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[56px] transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}