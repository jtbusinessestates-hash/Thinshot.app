import React from "react";
import { base44 } from "@/api/base44Client";
import { Camera, Plus, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmptyState from "@/components/EmptyState";
import ProGate from "@/components/ProGate";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const FREE_PHOTO_LIMIT = 3;

export default function Photos() {
  const [photos, setPhotos] = React.useState([]);
  const [settings, setSettings] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showProGate, setShowProGate] = React.useState(false);
  const [form, setForm] = React.useState({ photo_date: format(new Date(), "yyyy-MM-dd"), weight_at_date: "", notes: "", photo_url: "" });

  const isPro = settings?.is_pro === true;

  React.useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, s] = await Promise.all([
      base44.entities.PhotoLog.list("-date", 100),
      base44.entities.UserSettings.list("-created_date", 1),
    ]);
    setPhotos(p);
    setSettings(s[0] || null);
    setLoading(false);
  };

  const handleAddPhoto = () => {
    if (!isPro && photos.length >= FREE_PHOTO_LIMIT) {
      setShowProGate(true);
      return;
    }
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
    const user = await base44.auth.me().catch(() => null);
    if (!user) { alert("You must be logged in to save data"); return; }
    setSaving(true);
    try {
      await base44.entities.PhotoLog.create({
        photo_url: form.photo_url,
        date: form.photo_date,
        weight: form.weight_at_date ? parseFloat(form.weight_at_date) : undefined,
        notes: form.notes || "",
      });
      setShowForm(false);
      setForm({ photo_date: format(new Date(), "yyyy-MM-dd"), weight_at_date: "", notes: "", photo_url: "" });
      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const unit = settings?.weight_unit || "kg";

  return (
    <div className="space-y-6">
      {showProGate && <ProGate feature="Unlimited progress photos" onClose={() => setShowProGate(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Photos</h1>
          <p className="text-sm text-muted-foreground">Visual progress over time</p>
        </div>
        <Button onClick={handleAddPhoto} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Add Photo
        </Button>
      </div>

      {/* Free limit banner */}
      {!isPro && !loading && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>{photos.length}/{FREE_PHOTO_LIMIT} free photos used. <button onClick={() => setShowProGate(true)} className="underline font-semibold">Upgrade to Pro</button> for unlimited.</span>
        </div>
      )}

      {/* Add Photo Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-foreground">Add Progress Photo</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Photo Upload */}
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

      {/* Photo Grid */}
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-square">
              <img src={photo.photo_url} alt={photo.date} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-xs font-semibold">{format(parseISO(photo.date), "MMM d, yyyy")}</p>
                {photo.weight && (
                  <p className="text-white/80 text-xs">{photo.weight} {unit}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}