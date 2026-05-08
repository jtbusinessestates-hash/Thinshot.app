import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, RefreshCw, Pencil, Trash2, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const STATUSES = ['Not Contacted','DM Sent','Email Sent','Replied','Call Scheduled','Partnered','Declined','Follow Up'];
const PRIORITIES = ['Hot','Warm','Cold'];

const STATUS_COLORS = {
  'Not Contacted': 'bg-gray-100 text-gray-600',
  'DM Sent': 'bg-blue-100 text-blue-700',
  'Email Sent': 'bg-blue-100 text-blue-700',
  'Replied': 'bg-yellow-100 text-yellow-700',
  'Call Scheduled': 'bg-purple-100 text-purple-700',
  'Partnered': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
  'Follow Up': 'bg-pink-100 text-pink-700',
};

const IG_TEMPLATE = (doctorName = '[Doctor Name]', clinicName = '[Clinic Name]') =>
  `Hi ${doctorName}! I'm Judd, founder of ThinShot — a GLP-1 shot tracker built for patients on Ozempic, Wegovy, and Mounjaro. I'd love to partner with ${clinicName} — free Pro codes for your GLP-1 patients + a 20% referral commission on any who upgrade. No cost, no commitment. Would love to chat! 🌿`;

const EMAIL_TEMPLATE = (doctorName = '[Doctor Name]') =>
  `Subject: Partnership Opportunity — ThinShot GLP-1 Tracker\n\nHi ${doctorName},\n\nI'm Judd, founder of ThinShot — the GLP-1 shot tracker built for patients on Ozempic, Wegovy, and Mounjaro.\n\nWe're partnering with forward-thinking practices to give your GLP-1 patients a free companion app that tracks injections, weight, side effects, and dose history — all in one place.\n\nWhat we offer partnering clinics:\n✅ Free Pro codes for your patients (no cost to them)\n✅ A unique referral link that earns your practice 20% commission on upgrades\n✅ Better patient adherence between visits\n\nWould love to connect for a quick 15-minute call.\n\nBest,\nJudd\nFounder, ThinShot\nhello@thinshot.app | thinshot.app`;

function TemplateModal({ onClose }) {
  const [tab, setTab] = useState('ig');
  const [igCopied, setIgCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyIG = () => { navigator.clipboard.writeText(IG_TEMPLATE()); setIgCopied(true); toast.success('Copied to clipboard ✓'); setTimeout(() => setIgCopied(false), 2000); };
  const copyEmail = () => { navigator.clipboard.writeText(EMAIL_TEMPLATE()); setEmailCopied(true); toast.success('Copied to clipboard ✓'); setTimeout(() => setEmailCopied(false), 2000); };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Outreach Templates</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex border-b border-gray-100">
          {[['ig', 'Instagram DM'], ['email', 'Email']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === key ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {tab === 'ig' ? (
            <>
              <textarea readOnly value={IG_TEMPLATE()} className="w-full h-40 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none focus:outline-none" />
              <Button onClick={copyIG} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white gap-2">
                {igCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {igCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </>
          ) : (
            <>
              <textarea readOnly value={EMAIL_TEMPLATE()} className="w-full h-64 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none focus:outline-none" />
              <Button onClick={copyEmail} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {emailCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { clinic_name: '', doctor_name: '', specialty: '', email: '', phone: '', instagram_handle: '', website: '', city: '', state: '', outreach_status: 'Not Contacted', priority: 'Warm', first_contact_date: '', next_follow_up: '', notes: '' };

function ClinicModal({ clinic, onClose, onSave }) {
  const [form, setForm] = useState(clinic || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300";
  const Field = ({ label, children }) => <div><label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>{children}</div>;

  const handleSave = async () => {
    if (!form.clinic_name.trim()) { toast.error('Clinic name is required'); return; }
    setSaving(true);
    try {
      if (clinic?.id) { await base44.entities.ClinicOutreach.update(clinic.id, form); }
      else { await base44.entities.ClinicOutreach.create(form); }
      onSave(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{clinic?.id ? 'Edit Clinic' : 'Add Clinic'}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
          <div className="col-span-2"><Field label="Clinic Name *"><input className={inp} value={form.clinic_name} onChange={e => set('clinic_name', e.target.value)} /></Field></div>
          <Field label="Doctor Name"><input className={inp} value={form.doctor_name} onChange={e => set('doctor_name', e.target.value)} /></Field>
          <Field label="Specialty"><input className={inp} value={form.specialty} onChange={e => set('specialty', e.target.value)} /></Field>
          <Field label="Email"><input className={inp} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Phone"><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Instagram"><input className={inp} value={form.instagram_handle} onChange={e => set('instagram_handle', e.target.value)} /></Field>
          <Field label="Website"><input className={inp} value={form.website} onChange={e => set('website', e.target.value)} /></Field>
          <Field label="City"><input className={inp} value={form.city} onChange={e => set('city', e.target.value)} /></Field>
          <Field label="State"><input className={inp} value={form.state} onChange={e => set('state', e.target.value)} /></Field>
          <Field label="Status">
            <select className={inp} value={form.outreach_status} onChange={e => set('outreach_status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="First Contact"><input className={inp} type="date" value={form.first_contact_date} onChange={e => set('first_contact_date', e.target.value)} /></Field>
          <Field label="Next Follow Up"><input className={inp} type="date" value={form.next_follow_up} onChange={e => set('next_follow_up', e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Notes"><textarea className={`${inp} h-20 resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field></div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ClinicCRM() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { if (user && user.role !== 'admin') navigate('/dashboard'); }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ClinicOutreach.list('-created_date', 500);
    setClinics(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkEmail = async (c) => {
    await base44.entities.ClinicOutreach.update(c.id, { outreach_status: 'Email Sent', first_contact_date: format(new Date(), 'yyyy-MM-dd') });
    toast.success('Marked as Email Sent');
    load();
  };

  const handleFollowUp = async (c) => {
    await base44.entities.ClinicOutreach.update(c.id, { outreach_status: 'Follow Up', next_follow_up: format(addDays(new Date(), 7), 'yyyy-MM-dd') });
    toast.success('Follow-up set for 7 days');
    load();
  };

  const handleCopyDM = (c) => {
    const text = IG_TEMPLATE(c.doctor_name || '[Doctor Name]', c.clinic_name || '[Clinic Name]');
    navigator.clipboard.writeText(text);
    toast.success('DM copied to clipboard ✓');
  };

  const handleDelete = async () => {
    await base44.entities.ClinicOutreach.delete(deleteId);
    setDeleteId(null);
    toast.success('Clinic deleted');
    load();
  };

  const filtered = clinics.filter(c => {
    if (filterStatus && c.outreach_status !== filterStatus) return false;
    if (filterPriority && c.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.clinic_name?.toLowerCase().includes(q) && !c.doctor_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sel = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Clinic CRM</h1>
          <p className="text-sm text-muted-foreground">Outreach to clinics and practices</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowTemplates(true)} className="gap-2">
            <FileText className="w-4 h-4" /> Outreach Templates
          </Button>
          <Button onClick={() => setModal('add')} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Clinic
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className={sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={sel} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <input className={`${sel} flex-1 min-w-[160px]`} placeholder="Search clinic or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
              <tr>
                {['Clinic','Doctor','City/State','Status','Priority','Next Follow-Up','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No clinics found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{c.clinic_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{c.doctor_name || '—'}</div>
                    {c.specialty && <div className="text-xs text-muted-foreground">{c.specialty}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[c.outreach_status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.outreach_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.priority === 'Hot' ? 'bg-red-100 text-red-700' : c.priority === 'Warm' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {c.next_follow_up ? format(new Date(c.next_follow_up), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Copy DM" onClick={() => handleCopyDM(c)} className="p-1.5 hover:bg-pink-50 rounded-lg text-pink-500 transition-colors text-xs font-medium">
                        DM
                      </button>
                      <button title="Mark Email Sent" onClick={() => handleMarkEmail(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button title="Set Follow Up" onClick={() => handleFollowUp(c)} className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => setModal(c)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Delete" onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTemplates && <TemplateModal onClose={() => setShowTemplates(false)} />}
      {modal && <ClinicModal clinic={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={load} />}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete Clinic?</h3>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}