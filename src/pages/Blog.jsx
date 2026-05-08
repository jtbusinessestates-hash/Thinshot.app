import React from "react";
import { Search, Clock, ArrowLeft, ChevronRight, BookOpen, Share2, X } from "lucide-react";

const CATEGORY_STYLE = {
  "Medication Guide": { hex: "#5BA4A4", light: "#EBF5F5", emoji: "💊" },
  "Side Effects":     { hex: "#C9A84C", light: "#FBF5E6", emoji: "🤢" },
  "Nutrition":        { hex: "#5BA4A4", light: "#EBF5F5", emoji: "🥗" },
  "Getting Started":  { hex: "#7CAE8E", light: "#EEF5F1", emoji: "🌱" },
  "Injection Tips":   { hex: "#7CAE8E", light: "#EEF5F1", emoji: "💉" },
  "Tracking Tips":    { hex: "#7CAE8E", light: "#EEF5F1", emoji: "📊" },
  "FAQ":              { hex: "#C9A84C", light: "#FBF5E6", emoji: "❓" },
};

const POSTS = [
  {
    id: "1", featured: true,
    title: "How Many Clicks Is My Ozempic Dose? A Complete Pen Guide",
    category: "Medication Guide", mins: 6,
    desc: "Confused about Ozempic pen clicks? Learn exactly how many clicks equal your prescribed dose of 0.25mg, 0.5mg, 1mg, or 2mg.",
    body: `Starting Ozempic and wondering how many clicks your dose requires? You are not alone.

HOW THE OZEMPIC PEN WORKS

The Ozempic pen uses a click-based dosing dial. Each click delivers a precise amount of semaglutide. You dial to your prescribed dose before injecting.

DOSE REFERENCE CHART
• 0.25mg — Starting dose, first 4 weeks
• 0.5mg — Month 2 standard dose
• 1.0mg — Most common maintenance dose
• 2.0mg — Maximum approved dose

HOW TO SET YOUR DOSE
1. Remove pen cap and attach a new needle
2. Prime the pen — dial to flow check symbol and press until a drop appears
3. Dial your dose — turn selector to your prescribed number
4. Inject — insert needle, press and hold button until counter returns to 0
5. Count to 6 before removing the needle
6. Log your injection in ThinShot

COMMON MISTAKES TO AVOID

Mistake 1: Dialing past your dose — Ozempic pens cannot be dialed backwards.
Mistake 2: Not priming the pen — Always prime before first use.
Mistake 3: Removing the needle too quickly — Always count to 6 after the dose counter reaches 0.

This article is for informational purposes only. Always follow your prescriber's dosing instructions.`
  },
  {
    id: "2", featured: true,
    title: "7 Ways to Manage Ozempic Nausea (That Actually Work)",
    category: "Side Effects", mins: 7,
    desc: "Nausea is the #1 side effect of Ozempic, Wegovy, and Mounjaro. Here are 7 proven tips to reduce nausea on GLP-1 medications.",
    body: `Nausea is the number one reason people consider quitting their GLP-1 medication. Up to 44% of Ozempic users experience nausea in the first 4-8 weeks. The good news: most nausea is temporary and manageable.

WHY DOES OZEMPIC CAUSE NAUSEA?

GLP-1 medications slow gastric emptying — the rate at which food leaves your stomach. This causes your stomach to feel backed up or unsettled.

7 TIPS TO REDUCE NAUSEA

1. EAT SMALLER PORTIONS — Cut your portions by 30-40% and eat more slowly.
2. AVOID HIGH-FAT FOODS — Avoid fried foods, fast food, heavy sauces, and full-fat dairy.
3. STAY UPRIGHT AFTER EATING — Stay upright for at least 2 hours after eating.
4. INJECT AT NIGHT BEFORE BED — Sleep through the peak nausea window.
5. HYDRATE BETWEEN MEALS — Aim for 8-10 glasses of water daily between meals.
6. TRY GINGER — Ginger tea, ginger chews, or ginger capsules help significantly.
7. TRACK YOUR SYMPTOMS — Use ThinShot daily check-in to identify your nausea pattern.

WHEN TO CALL YOUR DOCTOR
Contact your prescriber if you experience vomiting lasting more than 2 days, inability to keep fluids down, or severe abdominal pain.

Most nausea on Ozempic improves significantly by weeks 4-8.`
  },
  {
    id: "3", featured: false,
    title: "How Much Protein Do You Need on Ozempic?",
    category: "Nutrition", mins: 8,
    desc: "GLP-1 medications reduce appetite but eating too little protein causes muscle loss. Here is exactly how much protein you need.",
    body: `One of the most underestimated risks of GLP-1 medications is muscle loss. Without adequate protein, a large portion of the weight you lose will be lean muscle, not fat.

WHY GLP-1 USERS LOSE MUSCLE

Without adequate protein your body breaks down muscle for energy, your metabolism slows down, you feel weaker, and weight regain is more likely if you stop the medication.

Studies show up to 40% of total weight lost on semaglutide can come from lean muscle mass in users who do not prioritize protein.

HOW MUCH PROTEIN DO YOU NEED?

Aim for 0.7-1g of protein per pound of body weight per day.
• 150 lbs → 105–150g protein daily
• 180 lbs → 126–180g protein daily
• 220 lbs → 154–220g protein daily
• 250 lbs → 175–250g protein daily

BEST PROTEIN SOURCES
• Greek yogurt — 17g per cup
• Cottage cheese — 14g per half cup
• Eggs — 6g each
• Chicken breast — 31g per 100g
• Tuna — 25g per 100g
• Protein shakes — 20–30g per serving

Protect your muscle. Hit your protein target every day.`
  },
  {
    id: "4", featured: false,
    title: "Ozempic vs Wegovy vs Mounjaro: What's the Difference?",
    category: "Medication Guide", mins: 9,
    desc: "A clear, no-fluff comparison of every major GLP-1 medication available today.",
    body: `Four medications. All inject weekly. All cause weight loss. Here is the clearest breakdown.

OZEMPIC (Semaglutide)
Approved for: Type 2 diabetes
Doses: 0.25mg to 2mg weekly
Average weight loss: 10–15% body weight

WEGOVY (Semaglutide)
Approved for: Chronic weight management
Doses: 0.25mg to 2.4mg weekly
Average weight loss: 15–17% body weight
Same drug as Ozempic, higher max dose

MOUNJARO (Tirzepatide)
Approved for: Type 2 diabetes
Doses: 2.5mg to 15mg weekly
Average weight loss: 20–22% body weight
Dual GIP and GLP-1 agonist — targets two receptors

ZEPBOUND (Tirzepatide)
Approved for: Chronic weight management
Same drug as Mounjaro, different brand for weight loss
Average weight loss: 20–22% body weight

KEY DIFFERENCES

Ozempic vs Wegovy: Same drug, different dose ceiling.
Semaglutide vs Tirzepatide: Tirzepatide targets two hormone receptors vs one, producing greater average weight loss.

Track your results on any GLP-1 with ThinShot.`
  },
  {
    id: "5", featured: false,
    title: "The Ultimate GLP-1 Injection Site Rotation Guide",
    category: "Injection Tips", mins: 5,
    desc: "Rotating your injection site prevents lumps and ensures consistent medication absorption.",
    body: `Injecting in the same spot every week causes lumpy scar tissue that reduces medication absorption. Rotation is not optional.

THE 3 APPROVED INJECTION SITES

1. ABDOMEN — Most popular site. Inject at least 2 inches from your belly button. Fastest absorption.
2. THIGH — Front or outer thigh only. Easy to self-inject.
3. UPPER ARM — Outer back of upper arm. Often requires assistance.

HOW TO ROTATE CORRECTLY

Never inject in the same exact spot twice in a row.
Stay at least 1 inch away from your last injection site.
Rotate between all three sites across different weeks.

A SIMPLE ROTATION SCHEDULE
Week 1: Left abdomen → Week 2: Right abdomen
Week 3: Left thigh → Week 4: Right thigh
Week 5: Left upper arm → Week 6: Right upper arm
Then repeat.

SIGNS OF POOR ROTATION
• Visible lumps under skin
• Rubbery or hard injection site
• Inconsistent medication effects
• Injection is more painful than usual

If you notice lumps, avoid that area completely for 4–6 weeks.`
  },
  {
    id: "6", featured: true,
    title: "What to Expect in Your First 12 Weeks on Ozempic",
    category: "Getting Started", mins: 10,
    desc: "A week-by-week breakdown of what most people experience in the first 12 weeks on semaglutide.",
    body: `Starting a GLP-1 medication is a big step. Here is what to expect week by week.

WEEKS 1–4: THE ADJUSTMENT PHASE (0.25mg)

What most people experience:
• Mild to moderate nausea after injection
• Reduced appetite — you feel full much faster
• Possible fatigue or headaches
• Little to no weight loss yet — 0.25mg is a tolerance dose

WEEKS 5–8: THE DOSE INCREASE (0.5mg)

What most people experience:
• Significant appetite reduction — food noise starts to quiet
• Weight loss becomes noticeable — typically 2–6 lbs
• Nausea may return briefly after dose increase then settle

What to do:
• Start prioritising protein — aim for 0.7–1g per pound of body weight
• Track your weekly weight in ThinShot

WEEKS 9–12: FINDING YOUR DOSE (1mg)

What most people experience:
• Consistent weight loss — most users are down 8–15 lbs from starting weight
• Appetite suppression is strong — you may forget to eat
• Side effects typically much milder

THE LONG GAME

Studies show semaglutide produces its maximum weight loss effect at around 60–68 weeks. The first 12 weeks are about tolerating the medication and building healthy habits.`
  },
];

const ALL_CATS = ["All", ...Array.from(new Set(POSTS.map(p => p.category)))];

function ArticleView({ post, onBack }) {
  const style = CATEGORY_STYLE[post.category] || CATEGORY_STYLE["FAQ"];
  const [scrollPct, setScrollPct] = React.useState(0);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const total = el.offsetHeight;
      const scrolled = Math.max(0, window.scrollY);
      setScrollPct(Math.min(100, (scrolled / Math.max(1, total - window.innerHeight)) * 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post.id]);

  const handleShare = () => {
    const text = `${post.title}\n\nRead more on ThinShot: https://thinshot.app/blog`;
    if (navigator.share) navigator.share({ title: post.title, text: post.desc, url: "https://thinshot.app/blog" });
    else navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
  };

  const blocks = post.body.split("\n\n");

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
        <div className="h-full transition-all duration-100" style={{ width: `${scrollPct}%`, backgroundColor: style.hex }} />
      </div>

      {/* Hero */}
      <div className="px-6 pt-12 pb-10" style={{ background: `linear-gradient(135deg, ${style.hex}DD, ${style.hex}99)` }}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </button>
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            {style.emoji} {post.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-white/75 text-sm">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.mins} min read</span>
            <span>ThinShot Wellness Team</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div ref={contentRef} className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-base font-medium text-foreground/60 italic mb-8 pb-6 border-b border-border leading-relaxed">{post.desc}</p>

        <div className="space-y-4">
          {blocks.map((block, i) => {
            const lines = block.split("\n");
            const firstLine = lines[0].trim();
            const isAllCaps = firstLine === firstLine.toUpperCase() && firstLine.length > 4 && !/^[•\d]/.test(firstLine);
            if (isAllCaps && lines.length <= 2) {
              return (
                <h2 key={i} className="text-base font-bold text-foreground mt-6 mb-1 pt-4 border-t border-border/50">
                  {firstLine}
                </h2>
              );
            }
            return (
              <p key={i} className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{block}</p>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border p-6 text-center" style={{ background: `${style.hex}18`, borderColor: `${style.hex}40` }}>
          <div className="text-3xl mb-3">🌿</div>
          <h3 className="font-bold text-foreground text-lg mb-2">Track Your Journey with ThinShot</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Log your doses, track side effects, and get AI-powered insights personalised to your GLP-1 journey.</p>
          <a href="/" className="inline-block text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: style.hex }}>
            Start Free — 7-Day Trial
          </a>
        </div>

        {/* Share */}
        <div className="mt-6 flex justify-center">
          <button onClick={handleShare} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-4 py-2.5">
            <Share2 className="w-4 h-4" /> Share this article
          </button>
        </div>

        <button onClick={onBack} className="mt-6 flex items-center gap-2 text-sm font-medium hover:underline mx-auto transition-colors" style={{ color: style.hex }}>
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </button>
      </div>
    </div>
  );
}

export default function Blog() {
  const [selected, setSelected] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("All");

  const filtered = POSTS.filter(p => {
    const matchCat = activeCat === "All" || p.category === activeCat;
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const featured = filtered.filter(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  if (selected) return <ArticleView post={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#7CAE8E] to-[#5BA4A4] px-6 pt-12 pb-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">GLP-1 Resource Hub</p>
          <h1 className="text-3xl font-bold text-white mb-2">ThinShot Blog</h1>
          <p className="text-white/80 text-sm mb-6">Evidence-based tips for your GLP-1 journey</p>
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white rounded-xl text-sm text-foreground placeholder:text-gray-400 outline-none shadow-lg border-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky category filter */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-2xl mx-auto pb-0.5">
          {ALL_CATS.map(cat => {
            const style = cat !== "All" ? CATEGORY_STYLE[cat] : null;
            const isActive = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all whitespace-nowrap"
                style={isActive && style ? {
                  backgroundColor: style.hex,
                  color: "#fff",
                  borderColor: style.hex,
                } : isActive ? {
                  backgroundColor: "#7CAE8E",
                  color: "#fff",
                  borderColor: "#7CAE8E",
                } : {
                  backgroundColor: "transparent",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }}
              >
                {cat === "All" ? "All Articles" : `${CATEGORY_STYLE[cat]?.emoji || ""} ${cat}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Featured</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {featured.map(post => {
                const s = CATEGORY_STYLE[post.category] || CATEGORY_STYLE["FAQ"];
                return (
                  <button key={post.id} onClick={() => setSelected(post)}
                    className="text-left bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="h-28 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${s.hex}CC, ${s.hex}88)` }}>
                      {s.emoji}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: s.hex }}>{post.category}</span>
                      <h2 className="text-sm font-bold text-foreground leading-snug mt-1 mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity">{post.title}</h2>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{post.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {post.mins} min</span>
                        <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: s.hex }}>Read <ChevronRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* More */}
        {rest.length > 0 && (
          <section>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              {activeCat === "All" ? "More Articles" : activeCat}
            </p>
            <div className="space-y-3">
              {rest.map(post => {
                const s = CATEGORY_STYLE[post.category] || CATEGORY_STYLE["FAQ"];
                return (
                  <button key={post.id} onClick={() => setSelected(post)}
                    className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all group flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${s.hex}CC, ${s.hex}66)` }}>
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: s.hex }}>{post.category}</span>
                      <h2 className="text-sm font-bold text-foreground leading-snug mt-0.5 mb-1 line-clamp-2 group-hover:opacity-80 transition-opacity">{post.title}</h2>
                      <p className="text-xs text-muted-foreground line-clamp-1">{post.desc}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5"><Clock className="w-3 h-3" /> {post.mins} min read</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:opacity-60 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">No articles found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
            <button onClick={() => { setSearch(""); setActiveCat("All"); }}
              className="mt-4 text-sm font-semibold hover:underline" style={{ color: "#7CAE8E" }}>
              Clear filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-2xl border p-6 text-center" style={{ background: "linear-gradient(135deg, #7CAE8E18, #5BA4A418)", borderColor: "#7CAE8E40" }}>
          <p className="text-sm font-bold text-foreground mb-1">Ready to start tracking?</p>
          <p className="text-xs text-muted-foreground mb-4">Join women on their GLP-1 journey with ThinShot</p>
          <a href="/" className="inline-block text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: "#7CAE8E" }}>
            Start Free — 7-Day Trial
          </a>
        </div>
      </div>
    </div>
  );
}