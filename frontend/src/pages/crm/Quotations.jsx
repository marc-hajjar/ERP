import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency, formatDate, statusBadgeClass, capitalize } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import { Plus, CheckCircle, XCircle, Send } from 'lucide-react';
import '../../styles/custom.css';

const EMPTY = { client_id:'', title:'', description:'', amount:'', valid_until:'' };

export default function Quotations() {
  const { data: quotes, loading, refetch } = useApi('/crm/quotations');
  const { data: clients } = useApi('/crm/clients');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await apiCall('/crm/quotations', 'POST', form);
      setShowModal(false); setForm(EMPTY); refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await apiCall(`/crm/quotations/${id}`, 'PATCH', { status });
    refetch();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading quotations…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Quotations</h1><p className="page-subtitle">Create and manage client quotations</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setShowModal(true); }}><Plus size={15} /> New Quotation</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Quote #</th><th>Title</th><th>Client</th><th>Amount</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {!quotes?.length && <tr><td colSpan={7} className="pd-empty-cell">No quotations yet</td></tr>}
            {quotes?.map(q => (
              <tr key={q.id}>
                <td className="td-accent-bold">{q.quote_number}</td>
                <td className="td-medium">{q.title}</td>
                <td className="td-secondary">{q.client_name || '—'}</td>
                <td className="td-bold">{formatCurrency(q.amount)}</td>
                <td className="td-secondary">{formatDate(q.valid_until)}</td>
                <td><span className={`badge ${statusBadgeClass(q.status)}`}>{capitalize(q.status)}</span></td>
                <td>
                  <div className="action-cell">
                    {q.status === 'draft' && <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(q.id,'sent')} title="Mark Sent"><Send size={13}/></button>}
                    {q.status === 'sent' && <>
                      <button className="btn btn-sm btn-ghost btn-text-green" onClick={() => updateStatus(q.id,'accepted')}><CheckCircle size={13}/></button>
                      <button className="btn btn-sm btn-ghost btn-text-red" onClick={() => updateStatus(q.id,'rejected')}><XCircle size={13}/></button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Quotation"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Saving…':'Create'}</button></>}>
        <div className="form-group"><label className="form-label">Title <span className="req">*</span></label><input className="form-input" placeholder="e.g. Scaffolding for Warehouse Project" value={form.title} onChange={e => setForm({...form, title:e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Client <span className="req">*</span></label>
            <select className="form-select" value={form.client_id} onChange={e => setForm({...form, client_id:e.target.value})}>
              <option value="">Select client…</option>
              {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Amount ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Valid Until <span className="req">*</span></label><input className="form-input" type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until:e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={4} placeholder="Scope of work, terms…" value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></div>
      </Modal>
    </div>
  );
}
