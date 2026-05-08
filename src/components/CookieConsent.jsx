import React from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-1">Cookie Consent</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              We use essential cookies to ensure the app functions properly. We also use analytics cookies to understand how you use ThinShot, which helps us improve the experience. You can choose to accept or decline non-essential cookies.
            </p>
            <div className="flex gap-3">
              <Button size="sm" onClick={handleAccept} className="text-xs rounded-lg">
                Accept All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDecline} className="text-xs rounded-lg">
                Essential Only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}