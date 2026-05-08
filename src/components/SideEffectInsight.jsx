import { Brain } from "lucide-react";

const INSIGHTS = {
  Ozempic: {
    nausea: { pct: 44, tip: "Eat smaller, more frequent meals and avoid fatty foods in the first 48h post-injection." },
    fatigue: { pct: 11, tip: "Rest is normal after starting. Light walking can actually help energy levels." },
    appetite: { pct: 60, tip: "Reduced appetite is the intended effect — aim for protein-rich meals to preserve muscle." },
    mood: { pct: 8, tip: "Mood changes are uncommon but real. Talk to your doctor if they persist beyond a week." },
  },
  Wegovy: {
    nausea: { pct: 44, tip: "Cold or room-temperature foods are easier to tolerate. Avoid eating while lying down." },
    fatigue: { pct: 14, tip: "Fatigue often peaks in weeks 1–4. Stay hydrated and prioritise sleep." },
    appetite: { pct: 65, tip: "Strong appetite suppression is expected. Track protein to stay above 80g/day." },
    mood: { pct: 9, tip: "GLP-1s can affect dopamine pathways. Journalling and sunlight exposure may help." },
  },
  Mounjaro: {
    nausea: { pct: 40, tip: "Nausea peaks 1–3 days post-injection. Ginger tea and small meals help significantly." },
    fatigue: { pct: 13, tip: "Fatigue is most common on dose escalation days. Don't schedule intense workouts those days." },
    appetite: { pct: 68, tip: "Mounjaro's dual action means strong appetite reduction — ensure you eat enough nutrients." },
    mood: { pct: 7, tip: "Some users report improved mood over time as weight decreases. Stay consistent." },
  },
  Saxenda: {
    nausea: { pct: 38, tip: "Saxenda nausea is dose-dependent. Slow titration is key — don't rush escalation." },
    fatigue: { pct: 10, tip: "Fatigue should reduce after 4–6 weeks on a stable dose." },
    appetite: { pct: 55, tip: "Appetite suppression improves over 12 weeks. Stick to regular meal times." },
    mood: { pct: 6, tip: "If mood dips, check your calorie intake — too little can affect energy and mood." },
  },
  default: {
    nausea: { pct: 40, tip: "Nausea is one of the most common GLP-1 side effects. Small, frequent meals help." },
    fatigue: { pct: 12, tip: "Rest when needed and stay hydrated. Fatigue typically improves after dose stabilisation." },
    appetite: { pct: 58, tip: "Appetite suppression is expected. Focus on nutrient-dense foods." },
    mood: { pct: 8, tip: "Mood changes can occur. Speak to your doctor if they persist." },
  },
};

const FIELD_LABELS = {
  nausea: "Nausea",
  fatigue: "Fatigue",
  appetite: "Low Appetite",
  mood: "Mood Changes",
};

export default function SideEffectInsight({ log, drugName, weekNumber }) {
  const drug = INSIGHTS[drugName] || INSIGHTS.default;

  // Find the worst-rated symptom (rating >= 3) to surface insight for
  const fields = ["nausea", "fatigue", "appetite", "mood"];
  const worst = fields
    .filter(f => log[f] >= 3)
    .sort((a, b) => log[b] - log[a])[0];

  if (!worst) return null;

  const insight = drug[worst];
  const week = weekNumber || "?";

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <Brain className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-800 mb-1">
            {insight.pct}% of users on {drugName || "this medication"} report {FIELD_LABELS[worst].toLowerCase()} around week {week}
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">{insight.tip}</p>
        </div>
      </div>
    </div>
  );
}