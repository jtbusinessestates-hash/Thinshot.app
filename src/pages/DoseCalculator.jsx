import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { CheckCircle2, RotateCcw, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MEDICATIONS = {
  Ozempic: {
    clickBased: true,
    doses: [
      { label: "0.25 mg", dose: 0.25, clicks: 18 },
      { label: "0.5 mg",  dose: 0.5,  clicks: 36 },
      { label: "1 mg",    dose: 1,    clicks: 72 },
      { label: "2 mg",    dose: 2,    clicks: 144 },
    ],
  },
  Wegovy: {
    clickBased: false,
    doses: [
      { label: "0.25 mg", dose: 0.25 },
      { label: "0.5 mg",  dose: 0.5 },
      { label: "1 mg",    dose: 1 },
      { label: "1.7 mg",  dose: 1.7 },
      { label: "2.4 mg",  dose: 2.4 },
    ],
  },
  Mounjaro: {
    clickBased: false,
    doses: [
      { label: "2.5 mg",  dose: 2.5 },
      { label: "5 mg",    dose: 5 },
      { label: "7.5 mg",  dose: 7.5 },
      { label: "10 mg",   dose: 10 },
      { label: "12.5 mg", dose: 12.5 },
      { label: "15 mg",   dose: 15 },
    ],
  },
  Zepbound: {
    clickBased: false,
    doses: [
      { label: "2.5 mg",  dose: 2.5 },
      { label: "5 mg",    dose: 5 },
      { label: "7.5 mg",  dose: 7.5 },
      { label: "10 mg",   dose: 10 },
      { label: "12.5 mg", dose: 12.5 },
      { label: "15 mg",   dose: 15 },
    ],
  },
  Saxenda: {
    clickBased: false,
    doses: [
      { label: "0.6 mg", dose: 0.6 },
      { label: "1.2 mg", dose: 1.2 },
      { label: "1.8 mg", dose: 1.8 },
      { label: "2.4 mg", dose: 2.4 },
      { label: "3 mg",   dose: 3 },
    ],
  },
};

export default function DoseCalculator() {
  const [drug, setDrug] = useState("Ozempic");
  const [selectedDoseIdx, setSelectedDoseIdx] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const med = MEDICATIONS[drug];
  const doseInfo = med.doses[selectedDoseIdx];
  const required = doseInfo?.clicks ?? 0;
  const done = med.clickBased && clickCount >= required;

  const handleMedChange = (name) => {
    setDrug(name);
    setSelectedDoseIdx(0);
    setClickCount(0);
  };

  const handleDoseChange = (idx) => {
    setSelectedDoseIdx(idx);
    setClickCount(0);
  };

  const handleClick = () => {
    if (done) return;
    if (navigator.vibrate) navigator.vibrate(30);
    setClickCount(c => Math.min(c + 1, required));
  };

  const handleReset = () => setClickCount(0);

  const handleLog = async () => {
    setSaving(true);
    try {
      await base44.entities.DoseCalculatorLog.create({
        drug_name: drug,
        pen_strength: doseInfo.label,
        prescribed_dose: doseInfo.dose,
        clicks_required: doseInfo.clicks ?? null,
        date: format(new Date(), "yyyy-MM-dd"),
      });
      toast.success("Dose logged!");
    } catch (e) {
      toast.error("Failed to save log.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-5">
      <h1 className="text-2xl font-bold font-heading text-foreground">Dose Calculator</h1>

      {/* Medication selector */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(MEDICATIONS).map(name => (
              <button
                key={name}
                onClick={() => handleMedChange(name)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  drug === name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:border-primary/40"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dose selector */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {med.doses.map((d, i) => (
              <button
                key={i}
                onClick={() => handleDoseChange(i)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  selectedDoseIdx === i
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:border-primary/40"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Click counter (Ozempic only) */}
      {med.clickBased ? (
        <Card className={cn("rounded-2xl transition-colors", done ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" : "")}>
          <CardContent className="pt-6 flex flex-col items-center gap-5">
            {done ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Dose complete!</p>
                <p className="text-sm text-muted-foreground">{required} clicks reached for {doseInfo.label}</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-7xl font-bold font-heading text-foreground tabular-nums">{clickCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">of <span className="font-semibold text-foreground">{required}</span> clicks</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-primary rounded-full transition-all duration-150"
                    style={{ width: `${(clickCount / required) * 100}%` }}
                  />
                </div>

                <button
                  onClick={handleClick}
                  className="w-40 h-40 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg active:scale-95 transition-transform select-none flex items-center justify-center"
                >
                  TAP TO<br />COUNT
                </button>
              </>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset counter
            </button>
          </CardContent>
        </Card>
      ) : (
        /* Fixed dose message */
        <Card className="rounded-2xl bg-accent/30 border-accent">
          <CardContent className="pt-6 flex flex-col items-center gap-3 text-center pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Fixed-dose pen</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              This pen delivers a fixed dose. No clicking required. Simply press and hold until the counter reaches zero (or the window turns red/green depending on your pen).
            </p>
          </CardContent>
        </Card>
      )}

      {/* Log button */}
      <Button
        className="w-full rounded-2xl h-12 font-semibold gap-2"
        onClick={handleLog}
        disabled={saving}
      >
        <Syringe className="w-4 h-4" />
        {saving ? "Saving…" : "Log This Dose"}
      </Button>
    </div>
  );
}