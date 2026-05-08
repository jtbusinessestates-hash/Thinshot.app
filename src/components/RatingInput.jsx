import { cn } from "@/lib/utils";

const ratingLabels = {
  1: "None",
  2: "Mild",
  3: "Moderate",
  4: "Strong",
  5: "Severe",
};

const moodLabels = {
  1: "Very Low",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export default function RatingInput({ label, value, onChange, isMood = false }) {
  const labels = isMood ? moodLabels : ratingLabels;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value > 0 && (
          <span className="text-xs text-muted-foreground">{labels[value]}</span>
        )}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-200 border",
              value === num
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}