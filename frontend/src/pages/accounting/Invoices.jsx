import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency, formatDate, statusBadgeClass, capitalize } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import { Plus, Check } from 'lucide-react';
import '../../styles/custom.css';

export default function Invoices() {
  const { data: invoices, loading, refetch } = useApi('/accounting/invoices');
  const { data: clients }  = useApi('/crm/clients');
  const { data: projects } = useApi('/projects');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_id: '', project_id: '', amount: '', tax_amount: '', due_date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleCreate = async () => {
    try {
      setSaving(true);
      await apiCall('/accounting/invoices', 'POST', form);
      setShowCreate(false);
      setForm({ client_id: '', project_id: '', amount: '', tax_amount: '', due_date: '', notes: '' });
      refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const markPaid = async (id) => {
    if (!confirm('Mark this invoice as paid?')) return;
    await apiCall(`/accounting/invoices/${id}`, 'PATCH', { status: 'paid', paid_date: new Date().toISOString().split('T')[0] });
    refetch();
  };

  const filtered = invoices?.filter(i => activeFilter === 'all' || i.status === activeFilter) ?? [];

  if (loading) return <div className="loading"><div className="spinner" /> Loading invoices…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Invoices</h1><p className="page-subtitle">Track client billing and payment status</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> New Invoice</button>
      </div>

      <div className="filters-bar">
        {['all','unpaid','paid','partial','overdue'].map(s => (
          <button key={s} onClick={() => setActiveFilter(s)} className={`btn btn-sm ${activeFilter === s ? 'btn-primary' : 'btn-secondary'}`}>{capitalize(s)}</button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Invoice #</th><th>Client</th><th>Project</th><th>Amount</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={8} className="pd-empty-cell">No invoices found</td></tr>}
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td className="td-accent-bold">{inv.invoice_number}</td>
                <td>{inv.client_name || '—'}</td>
                <td className="td-secondary">{inv.project_name || '—'}</td>
                <td className="td-bold">{formatCurrency(inv.total_amount)}</td>
                <td className="td-secondary">{formatDate(inv.issue_date)}</td>
                <td className="td-secondary">{formatDate(inv.due_date)}</td>
                <td><span className={`badge ${statusBadgeClass(inv.status)}`}>{capitalize(inv.status)}</span></td>
                <td>{inv.status !== 'paid' && <button className="btn btn-sm btn-ghost" onClick={() => markPaid(inv.id)}><Check size={13} /> Mark Paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Invoice"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Invoice'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Client <span className="req">*</span></label>
            <select className="form-select" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
              <option value="">Select client…</option>
              {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Project (optional)</label>
            <select className="form-select" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
              <option value="">Select project…</option>
              {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Amount ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Tax ($)</label><input className="form-input" type="number" placeholder="0.00" value={form.tax_amount} onChange={e => setForm({...form, tax_amount: e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Due Date <span className="req">*</span></label><input className="form-input" type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
    </div>
  );
}
