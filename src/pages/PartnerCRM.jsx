import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, RefreshCw, Pencil, Trash2, Building2, Flame, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

const PARTNER_TYPES = ['Telehealth Platform','Pharmacy App','Supplement Brand','Wellness Brand','Insurance','Employer Benefits','Media / Press','Healthcare Tech','Other'];
const STATUSES = ['Not Contacted','DM Sent','Email Sent','Replied','Call Scheduled','Negotiating','Deal Closed','Declined','Follow Up'];
const PARTNERSHIP_TYPES = ['API Integration','Co-Marketing','White Label','Referral Program','Sponsorship','Affiliate','Data Partnership','Other'];
const PRIORITIES = ['Hot','Warm','Cold'];

const STATUS_COLORS = {
  'Not Contacted': 'bg-gray-100 text-gray-600',
  'DM Sent': 'bg-blue-100 text-blue-700',
  'Email Sent': 'bg-blue-100 text-blue-700',
  'Replied': 'bg-yellow-100 text-yellow-700',
  'Call Scheduled': 'bg-purple-100 text-purple-700',
  'Negotiating': 'bg-orange-100 text-orange-700',
  'Deal Closed': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
  'Follow Up': 'bg-pink-100 text-pink-700',
};

const PRIORITY_COLORS = {
  'Hot': 'bg-red-100 text-red-700',
  'Warm': 'bg-orange-100 text-orange-700',
  'Cold': 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
  company_name: '', contact_name: '', title: '', partner_type: '', email: '', phone: '',
  website: '', instagram_handle: '', linkedin_url: '', partnership_type: '', proposed_deal: '',
  outreach_status: 'Not Contacted', priority: 'Warm', potential_value: '', first_contact_date: '',
  last_follow_up: '', next_follow_up: '', notes: '',
};

function PartnerModal({ partner, onClose, onSave }) {
  const [form, setForm] = useState(partner || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.company_name.trim()) { toast.error('Company name is required'); return; }
    setSaving(true);
    try {
      const data = { ...form, potential_value: form.potential_value ? Number(form.potential_value) : null };
      if (partner?.id) {
        await base44.entities.PartnerOutreach.update(partner.id, data);
      } else {
        await base44.entities.PartnerOutreach.create(data);
      }
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">{partner?.id ? 'Edit Partner' : 'Add Partner'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Company Name *">
              <input className={inp} value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </Field>
          </div>
          <Field label="Contact Name"><input className={inp} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} /></Field>
          <Field label="Title"><input className={inp} value={form.title} onChange={e => set('title', e.target.value)} /></Field>
          <Field label="Partner Type">
            <select className={inp} value={form.partner_type} onChange={e => set('partner_type', e.target.value)}>
              <option value="">Select...</option>
              {PARTNER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Partnership Type">
            <select className={inp} value={form.partnership_type} onChange={e => set('partnership_type', e.target.value)}>
              <option value="">Select...</option>
              {PARTNERSHIP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Email"><input className={inp} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Phone"><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Website"><input className={inp} value={form.website} onChange={e => set('website', e.target.value)} /></Field>
          <Field label="Instagram Handle"><input className={inp} value={form.instagram_handle} onChange={e => set('instagram_handle', e.target.value)} /></Field>
          <div className="col-span-2">
            <Field label="LinkedIn URL"><input className={inp} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Proposed Deal"><textarea className={`${inp} h-20 resize-none`} value={form.proposed_deal} onChange={e => set('proposed_deal', e.target.value)} /></Field>
          </div>
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
          <Field label="Potential Value ($)"><input className={inp} type="number" value={form.potential_value} onChange={e => set('potential_value', e.target.value)} /></Field>
          <Field label="First Contact Date"><input className={inp} type="date" value={form.first_contact_date} onChange={e => set('first_contact_date', e.target.value)} /></Field>
          <Field label="Last Follow Up"><input className={inp} type="date" value={form.last_follow_up} onChange={e => set('last_follow_up', e.target.value)} /></Field>
          <Field label="Next Follow Up"><input className={inp} type="date" value={form.next_follow_up} onChange={e => set('next_follow_up', e.target.value)} /></Field>
          <div className="col-span-2">
            <Field label="Notes"><textarea className={`${inp} h-20 resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PartnerCRM() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | partner object
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.PartnerOutreach.list('-created_date', 500);
    setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkEmail = async (p) => {
    await base44.entities.PartnerOutreach.update(p.id, {
      outreach_status: 'Email Sent',
      first_contact_date: format(new Date(), 'yyyy-MM-dd'),
    });
    toast.success('Marked as Email Sent');
    load();
  };

  const handleFollowUp = async (p) => {
    await base44.entities.PartnerOutreach.update(p.id, {
      outreach_status: 'Follow Up',
      next_follow_up: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    });
    toast.success('Follow-up set for 7 days');
    load();
  };

  const handleDelete = async () => {
    await base44.entities.PartnerOutreach.delete(deleteId);
    setDeleteId(null);
    toast.success('Partner deleted');
    load();
  };

  const filtered = partners.filter(p => {
    if (filterType && p.partner_type !== filterType) return false;
    if (filterStatus && p.outreach_status !== filterStatus) return false;
    if (filterPriority && p.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.company_name?.toLowerCase().includes(q) && !p.contact_name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalValue = partners.reduce((s, p) => s + (p.potential_value || 0), 0);
  const hotLeads = partners.filter(p => p.priority === 'Hot').length;
  const dealsClosed = partners.filter(p => p.outreach_status === 'Deal Closed').length;

  const sel = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Partner Outreach CRM</h1>
          <p className="text-sm text-muted-foreground">Manage company and media partnerships</p>
        </div>
        <Button onClick={() => setModal('add')} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Partner
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total in Pipeline', value: partners.length, icon: Target, color: 'bg-primary/10 text-primary' },
          { label: 'Hot Leads', value: hotLeads, icon: Flame, color: 'bg-red-100 text-red-600' },
          { label: 'Deals Closed', value: dealsClosed, icon: Building2, color: 'bg-green-100 text-green-600' },
          { label: 'Total Potential Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className={sel} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Partner Types</option>
          {PARTNER_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className={sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={sel} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <input
          className={`${sel} flex-1 min-w-[160px]`}
          placeholder="Search company or contact..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
              <tr>
                {['Company','Type','Contact','Partnership Type','Status','Priority','Potential Value','Next Follow-Up','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No partners found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{p.company_name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.partner_type || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-foreground">{p.contact_name || '—'}</div>
                    {p.title && <div className="text-xs text-muted-foreground">{p.title}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.partnership_type || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.outreach_status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.outreach_status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[p.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {p.priority || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {p.potential_value ? `$${Number(p.potential_value).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {p.next_follow_up ? format(new Date(p.next_follow_up), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Mark Email Sent" onClick={() => handleMarkEmail(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button title="Set Follow Up" onClick={() => handleFollowUp(p)} className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => setModal(p)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button title="Delete" onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
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

      {/* Add/Edit Modal */}
      {modal && (
        <PartnerModal
          partner={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete Partner?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
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