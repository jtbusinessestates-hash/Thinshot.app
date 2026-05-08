import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EMPTY_AMB = { name: '', email: '', referral_code: '', referral_link: '', commission_rate: '', notes: '', status: 'active' };

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-emerald-600 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function AmbModal({ amb, onClose, onSave }) {
  const [form, setForm] = useState(amb || EMPTY_AMB);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({
    ...f, [k]: v,
    ...(k === 'referral_code' ? { referral_link: `https://thinshot.app?ref=${v}` } : {}),
  }));

  const handleSave = async () => {
    if (!form.email) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      const data = { ...form, commission_rate: form.commission_rate ? Number(form.commission_rate) : null };
      if (amb?.id) {
        await base44.entities.Ambassador.update(amb.id, data);
      } else {
        await base44.entities.Ambassador.create(data);
      }
      onSave(); onClose();
    } finally { setSaving(false); }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300";
  const Field = ({ label, children }) => <div><label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>{children}</div>;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{amb?.id ? 'Edit Ambassador' : 'Add Ambassador'}</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <Field label="Name"><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></Field>
          <Field label="Email *"><input className={inp} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Referral Code"><input className={inp} value={form.referral_code} onChange={e => set('referral_code', e.target.value)} /></Field>
          <Field label="Referral Link">
            <input className={`${inp} bg-gray-50 text-gray-500`} value={form.referral_link || (form.referral_code ? `https://thinshot.app?ref=${form.referral_code}` : '')} readOnly />
          </Field>
          <Field label="Commission Rate (%)"><input className={inp} type="number" value={form.commission_rate} onChange={e => set('commission_rate', e.target.value)} /></Field>
          <Field label="Status">
            <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Notes"><textarea className={`${inp} h-20 resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
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

export default function AdminAmbassadors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { if (user && user.role !== 'admin') navigate('/dashboard'); }, [user]);

  const load = async () => {
    setLoading(true);
    const [ambs, refs] = await Promise.all([
      base44.entities.Ambassador.list('-created_date', 200),
      base44.entities.Referral.list('-created_date', 500),
    ]);
    setAmbassadors(ambs || []);
    setReferrals(refs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    await base44.entities.Ambassador.delete(deleteId);
    setDeleteId(null);
    toast.success('Ambassador deleted');
    load();
  };

  const handleMarkPaid = async (ref) => {
    await base44.entities.Referral.update(ref.id, { status: 'paid' });
    toast.success('Marked as paid');
    load();
  };

  const pendingTotal = referrals.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.commission || 0), 0);
  const paidTotal = referrals.filter(r => r.status === 'paid').reduce((s, r) => s + (r.commission || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* SECTION 1: Ambassadors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Ambassadors</h1>
            <p className="text-sm text-muted-foreground">Manage ambassador accounts and referral codes</p>
          </div>
          <Button onClick={() => setModal('add')} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Ambassador
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
                <tr>
                  {['Name','Email','Code','Referral Link','Rate','Clicks','Signups','Revenue','Commission','Status','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ambassadors.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">No ambassadors yet</td></tr>
                ) : ambassadors.map(a => {
                  const link = a.referral_link || `https://thinshot.app?ref=${a.referral_code}`;
                  const ambRefs = referrals.filter(r => r.referral_code === a.referral_code);
                  const revenue = ambRefs.reduce((s, r) => s + (r.amount || 0), 0);
                  const commission = ambRefs.reduce((s, r) => s + (r.commission || 0), 0);
                  const signups = ambRefs.length;
                  return (
                    <tr key={a.id} className="hover:bg-muted/20">
                      <td className="px-3 py-3 font-semibold text-foreground whitespace-nowrap">{a.name || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{a.email}</td>
                      <td className="px-3 py-3 font-mono text-xs bg-muted/20 whitespace-nowrap">{a.referral_code}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 max-w-[180px]">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs truncate">{link}</a>
                          <CopyBtn text={link} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{a.commission_rate != null ? `${a.commission_rate}%` : '—'}</td>
                      <td className="px-3 py-3 text-center">{a.total_clicks || 0}</td>
                      <td className="px-3 py-3 text-center">{signups}</td>
                      <td className="px-3 py-3 whitespace-nowrap">${revenue.toFixed(2)}</td>
                      <td className="px-3 py-3 font-semibold text-emerald-600 whitespace-nowrap">${commission.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${a.active !== false && a.status !== 'inactive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {a.active !== false && a.status !== 'inactive' ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModal(a)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Referral Transactions */}
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">Referral Transactions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Total Pending Commissions: <span className="font-semibold text-amber-600">${pendingTotal.toFixed(2)}</span>
          {' · '}
          Total Paid: <span className="font-semibold text-emerald-600">${paidTotal.toFixed(2)}</span>
        </p>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
                <tr>
                  {['Ambassador Code','User Email','Plan','Amount','Commission','Date','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No referral transactions yet</td></tr>
                ) : referrals.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">{r.referral_code}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.user_email || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.subscription_type || '—'}</td>
                    <td className="px-4 py-3">{r.amount ? `$${r.amount}` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{r.commission ? `$${r.commission}` : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {r.created_date ? format(new Date(r.created_date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status !== 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkPaid(r)} className="text-xs h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && <AmbModal amb={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={load} />}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete Ambassador?</h3>
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