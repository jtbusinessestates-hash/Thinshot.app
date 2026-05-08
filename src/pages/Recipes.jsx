import React from "react";
import { base44 } from "@/api/base44Client";
import { UtensilsCrossed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import BackToDashboard from "@/components/BackToDashboard";

const getRecipeImage = (name, imageUrl) => {
  if (imageUrl && !imageUrl.includes("placeholder")) return imageUrl;
  const keyword = encodeURIComponent((name || "healthy food").replace(/[^a-zA-Z0-9 ]/g, "").split(" ").slice(0, 3).join(" ") + " food");
  return `https://source.unsplash.com/400x300/?${keyword}`;
};

export default function Recipes() {
  const CATEGORIES = ["All", "High Protein", "Meal Prep", "Low Nausea", "Shot Day Friendly", "Breakfast", "Lunch", "Dinner", "Snack"];
  const [recipes, setRecipes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [adding, setAdding] = React.useState(null);

  React.useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Recipe.list("-created_date", 50);
      setRecipes(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  };

  const addToDay = async (recipe) => {
    setAdding(recipe.id);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const all = await base44.entities.NutritionLog.list("-date", 60);
      const existing = all.find(r => r.date === today);
      const payload = {
        date: today,
        protein_g: ((existing?.protein_g || 0) + (recipe.protein_g || 0)),
        calories: ((existing?.calories || 0) + (recipe.calories || 0)),
        carbs_g: ((existing?.carbs_g || 0) + (recipe.carbs_g || 0)),
        fat_g: ((existing?.fat_g || 0) + (recipe.fat_g || 0)),
      };
      if (existing) {
        await base44.entities.NutritionLog.update(existing.id, payload);
      } else {
        await base44.entities.NutritionLog.create(payload);
      }
      toast.success("Added to today's nutrition 👌");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add recipe macros.");
    } finally {
      setAdding(null);
    }
  };

  const filtered = recipes
    .filter(r => selectedCategory === "All" ? true : (r.category === selectedCategory || (r.tags && r.tags.toLowerCase().includes(selectedCategory.toLowerCase()))))
    .filter(r =>
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Recipes</h1>
        <p className="text-sm text-muted-foreground">High-protein GLP-1 friendly meals</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="rounded-xl pl-9"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border"
            }`}
          >{cat}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recipes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(recipe => (
            <div key={recipe.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <img
                src={getRecipeImage(recipe.title, recipe.image_url)}
                alt={recipe.title}
                className="w-full h-44 object-cover"
                onError={e => { e.target.src = `https://source.unsplash.com/400x300/?healthy-food`; }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">{recipe.title}</h3>
                  {recipe.tags && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2 flex-shrink-0">{recipe.tags.split(",")[0]}</span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground mb-3 mt-1">
                  {recipe.protein_g && <span className="font-semibold text-blue-600">{recipe.protein_g}g protein</span>}
                  {recipe.calories && <span>{recipe.calories} kcal</span>}
                  {recipe.prep_time_mins && <span>{recipe.prep_time_mins} min</span>}
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => addToDay(recipe)}
                  disabled={adding === recipe.id}
                >
                  {adding === recipe.id ? "Adding..." : "Add to My Day"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}