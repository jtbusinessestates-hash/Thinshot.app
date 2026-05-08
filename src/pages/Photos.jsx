import React from "react";
import { base44 } from "@/api/base44Client";
import { hasPro } from "@/lib/subscriptionUtils";
import { Camera, Plus, X, Lock, Trash2, GitCompare, Share2, Clock, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmptyState from "@/components/EmptyState";
import ProGate from "@/components/ProGate";
import { format, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import PhotoCompare from "@/components/photos/PhotoCompare";
import ShareCard from "@/components/photos/ShareCard";
import { showSageInsight } from "@/components/photos/SageInsightToast";

const FREE_PHOTO_LIMIT = 3;

export default function Photos() {
  const [photos, setPhotos] = React.useState([]);
  const [settings, setSettings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showProGate, setShowProGate] = React.useState(false);
  const [view, setView] = React.useState("timeline"); // "timeline" | "grid"
  const [showCompare, setShowCompare] = React.useState(false);
  const [sharePhoto, setSharePhoto] = React.useState(null);
  const [form, setForm] = React.useState({
    photo_date: format(new Date(), "yyyy-MM-dd"),
    weight_at_date: "",
    notes: "",
    photo_url: "",
  });

  const isPro = hasPro(settings);

  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      base44.entities.PhotoLog.list("-date", 100),
      base44.entities.UserSettings.list(),
    ]);
    setPhotos(p);
    setSettings(s?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))?.[0] || null);
    setLoading(false);
  };

  const handleAddPhoto = () => {
    if (!isPro && photos.length >= FREE_PHOTO_LIMIT) { setShowProGate(true); return; }
    setShowForm(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.photo_url) { toast.error("Please upload a photo first."); return; }
    setSaving(true);
    try {
      const newPhoto = await base44.entities.PhotoLog.create({
        photo_url: form.photo_url,
        date: form.photo_date,
        weight: form.weight_at_date ? parseFloat(form.weight_at_date) : undefined,
        notes: form.notes || "",
      });
      setShowForm(false);
      setForm({ photo_date: format(new Date(), "yyyy-MM-dd"), weight_at_date: "", notes: "", photo_url: "" });
      const refreshed = await base44.entities.PhotoLog.list("-date", 100);
      setPhotos(refreshed);
      // Fire Sage insight in background
      showSageInsight({ photos: refreshed, newPhoto, unit, settings });
    } catch (_) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photoId) => {
    // delete confirmed by user action
    await base44.entities.PhotoLog.delete(photoId);
    await loadData();
  };

  const unit = settings?.weight_unit || "kg";

  // Sorted oldest→newest for timeline
  const chronological = [...photos].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstPhoto = chronological[0];
  const firstWeight = firstPhoto?.weight;

  // Streak: consecutive days with any log (medication/weight/photo) — approximate from photo dates
  const streakDays = (() => {
    if (!firstPhoto) return 0;
    return differenceInDays(new Date(), new Date(firstPhoto.date));
  })();

  const weightLostSinceStart = (photo) => {
    if (!firstWeight || !photo.weight) return null;
    return parseFloat((firstWeight - photo.weight).toFixed(1));
  };

  return (
    <div className="space-y-6">
      {showProGate && <ProGate feature="Unlimited progress photos" onClose={() => setShowProGate(false)} />}
      {showCompare && <PhotoCompare photos={photos} unit={unit} onClose={() => setShowCompare(false)} />}
      {sharePhoto && (
        <ShareCard
          photo={sharePhoto}
          weightLost={weightLostSinceStart(sharePhoto) || 0}
          unit={unit}
          streakDays={streakDays}
          onClose={() => setSharePhoto(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Photos</h1>
          <p className="text-sm text-muted-foreground">Visual progress over time</p>
        </div>
        <div className="flex items-center gap-2">
          {photos.length >= 2 && (
            <Button variant="outline" size="sm" onClick={() => setShowCompare(true)} className="rounded-xl gap-1.5">
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </Button>
          )}
          <Button onClick={handleAddPhoto} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Photo
          </Button>
        </div>
      </div>

      {/* View toggle */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      )}

      {/* Free limit banner */}
      {!isPro && !loading && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            {photos.length}/{FREE_PHOTO_LIMIT} free photos used.{" "}
            <button onClick={() => setShowProGate(true)} className="underline font-semibold">Upgrade to Pro</button> for unlimited.
          </span>
        </div>
      )}

      {/* Add Photo Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Add Progress Photo</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Photo *</Label>
                <label className="block cursor-pointer">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-border" />
                  ) : (
                    <div className="w-full h-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 mb-2" />
                          <span className="text-sm">Tap to upload photo</span>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date *</Label>
                  <Input className="rounded-xl" type="date" value={form.photo_date} onChange={e => setForm({ ...form, photo_date: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight ({unit})</Label>
                  <Input className="rounded-xl" type="number" step="0.1" value={form.weight_at_date} onChange={e => setForm({ ...form, weight_at_date: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input className="rounded-xl" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional note..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={saving || uploading || !form.photo_url} className="flex-1 rounded-xl">
                  {saving ? "Saving..." : "Save Photo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-muted rounded-xl" />)}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Add your first progress photo to track your visual transformation."
          action={<Button onClick={handleAddPhoto} className="rounded-xl gap-2"><Plus className="w-4 h-4" />Add First Photo</Button>}
        />
      ) : view === "timeline" ? (
        /* ── TIMELINE VIEW ── */
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {chronological.map((photo, idx) => {
              const lost = weightLostSinceStart(photo);
              const weekNum = firstPhoto
                ? Math.floor((new Date(photo.date) - new Date(firstPhoto.date)) / (7 * 24 * 60 * 60 * 1000))
                : 0;
              return (
                <div key={photo.id} className="flex gap-4 items-start">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-14 flex-shrink-0 flex flex-col items-center`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${idx === chronological.length - 1 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>
                      {weekNum === 0 ? "S" : `W${weekNum}`}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={photo.photo_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/40 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                      {photo.weight && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                          <span className="text-white text-xs font-bold">{photo.weight} {unit}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{photo.date ? format(parseISO(photo.date), "MMMM d, yyyy") : "Unknown date"}</p>
                        {lost !== null && lost > 0 && (
                          <p className="text-xs text-primary font-medium">-{lost} {unit} from start 🎉</p>
                        )}
                        {photo.notes && <p className="text-xs text-muted-foreground mt-0.5">{photo.notes}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSharePhoto(photo)}
                        className="rounded-xl gap-1.5 flex-shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-square">
              <img src={photo.photo_url} alt={photo.date} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-xs font-semibold">{photo.date ? format(parseISO(photo.date), "MMM d, yyyy") : "Unknown date"}</p>
                {photo.weight && <p className="text-white/80 text-xs">{photo.weight} {unit}</p>}
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setSharePhoto(photo)}
                  className="w-7 h-7 rounded-lg bg-black/40 hover:bg-primary flex items-center justify-center"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="w-7 h-7 rounded-lg bg-black/40 hover:bg-destructive flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}