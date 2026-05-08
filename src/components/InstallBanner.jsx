import React from "react";
import { X, Share, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallBanner() {
  const [visible, setVisible] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    const dismissed = localStorage.getItem("install_banner_dismissed");
    if (dismissed) return;

    const ua = navigator.userAgent;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone) return; // already installed

    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    const mobile = ios || android;

    if (!mobile) return;

    setIsIOS(ios);
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("install_banner_dismissed", "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 lg:hidden"
        >
          <div className="bg-foreground text-background rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              {isIOS ? <Share className="w-5 h-5 text-primary-foreground" /> : <Download className="w-5 h-5 text-primary-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">Install ThinShot on your phone</p>
              <p className="text-xs opacity-70 mt-0.5 leading-relaxed">
                {isIOS
                  ? "Tap Share → Add to Home Screen"
                  : "Tap the menu → Add to Home Screen / Install App"}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}