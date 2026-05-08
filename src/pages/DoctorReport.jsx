import React from "react";
import { base44 } from "@/api/base44Client";
import { format, subDays, parseISO } from "date-fns";
import { Pill } from "lucide-react";

// Public page — no auth required
export default function DoctorReport() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const cutoff = subDays(new Date(), 90);
        const [ml, sl, wl, sets] = await Promise.all([
          base44.entities.MedicationLog.list("-injection_date", 200),
          base44.entities.SideEffectLog.list("-date", 200),
          base44.entities.WeightLog.list("-date", 200),
          base44.entities.UserSettings.list("-created_date", 1),
        ]);
        const since90 = d => d && new Date(d) >= cutoff;
        setData({
          medLogs: ml.filter(m => since90(m?.injection_date)),
          sideEffectLogs: sl.filter(s => since90(s?.date)),
          weightLogs: wl.filter(w => since90(w?.date)),
          settings: sets?.[0] || null,
        });
      } catch (e) {
        setError("Unable to load report data.");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading report…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-destructive text-sm">{error}</p>
    </div>
  );

  const { medLogs, sideEffectLogs, weightLogs, settings } = data;
  const unit = settings?.weight_unit || "kg";
  const sortedWeight = [...weightLogs].filter(w => w?.date && w?.weight).sort((a, b) => new Date(a.date) - new Date(b.date));
  const weightLost = sortedWeight.length >= 2
    ? (sortedWeight[0].weight - sortedWeight[sortedWeight.length - 1].weight).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10 print:p-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Pill className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">ThinShot Patient Report</h1>
          <p className="text-sm text-muted-foreground">Last 90 days · Generated {format(new Date(), "MMMM d, yyyy")}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto text-xs font-medium text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 print:hidden transition-colors"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Weight Summary */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">Weight Progress</h2>
        {weightLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weight logs in the last 90 days.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Start Weight</p>
                <p className="font-bold text-foreground">{sortedWeight[0]?.weight} {unit}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                <p className="font-bold text-foreground">{sortedWeight[sortedWeight.length - 1]?.weight} {unit}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Lost</p>
                <p className="font-bold text-primary">{weightLost ?? "—"} {unit}</p>
              </div>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Weight</th>
                  <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Waist</th>
                </tr>
              </thead>
              <tbody>
                {sortedWeight.map(w => (
                  <tr key={w.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{w?.date ? format(parseISO(w.date), "MMM d, yyyy") : "—"}</td>
                    <td className="py-2 text-right text-foreground">{w?.weight ?? "—"} {unit}</td>
                    <td className="py-2 text-right text-muted-foreground">{w?.waist_cm ? `${w.waist_cm} cm` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {/* Medication Logs */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">Injection History ({medLogs.length} injections)</h2>
        {medLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No injections in the last 90 days.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Medication</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Dose</th>
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Site</th>
              </tr>
            </thead>
            <tbody>
              {medLogs.map(m => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{m?.injection_date ? format(new Date(m.injection_date), "MMM d, yyyy") : "—"}</td>
                  <td className="py-2 text-foreground">{m?.drug_name === "Custom" ? (m?.custom_drug_name ?? "Custom") : (m?.drug_name ?? "—")}</td>
                  <td className="py-2 text-right text-foreground">{m?.dose_mg ?? "—"} mg</td>
                  <td className="py-2 text-right text-muted-foreground">{m?.injection_site ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Side Effects Summary */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">Side Effect Logs ({sideEffectLogs.length} check-ins)</h2>
        {sideEffectLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins in the last 90 days.</p>
        ) : (
          <>
            {(() => {
              const avg = f => (sideEffectLogs.reduce((s, l) => s + (l[f] || 0), 0) / sideEffectLogs.length).toFixed(1);
              return (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {["nausea", "fatigue", "appetite", "mood"].map(f => (
                    <div key={f} className="bg-secondary/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground capitalize mb-1">{f}</p>
                      <p className="font-bold text-foreground">{avg(f)}/5 avg</p>
                    </div>
                  ))}
                </div>
              );
            })()}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Date</th>
                  <th className="text-center py-2 text-xs font-semibold text-muted-foreground">Nausea</th>
                  <th className="text-center py-2 text-xs font-semibold text-muted-foreground">Fatigue</th>
                  <th className="text-center py-2 text-xs font-semibold text-muted-foreground">Appetite</th>
                  <th className="text-center py-2 text-xs font-semibold text-muted-foreground">Mood</th>
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[...sideEffectLogs].filter(s => s?.date).sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{format(parseISO(s.date), "MMM d")}</td>
                    <td className="py-2 text-center text-foreground">{s?.nausea ?? "—"}</td>
                    <td className="py-2 text-center text-foreground">{s?.fatigue ?? "—"}</td>
                    <td className="py-2 text-center text-foreground">{s?.appetite ?? "—"}</td>
                    <td className="py-2 text-center text-foreground">{s?.mood ?? "—"}</td>
                    <td className="py-2 text-muted-foreground text-xs">{s?.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <footer className="pt-6 border-t border-border text-xs text-muted-foreground">
        This report was generated by ThinShot — a personal GLP-1 medication tracker. It is not a medical document. Please consult your healthcare provider for clinical decisions.
      </footer>
    </div>
  );
}