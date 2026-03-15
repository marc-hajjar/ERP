import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import { Plus, Trash2 } from 'lucide-react';
import '../../styles/custom.css';

const CATEGORIES = ['materials','transportation','labor','maintenance','equipment','other'];

export default function Expenses() {
  const { data: expenses, loading, refetch } = useApi('/accounting/expenses');
  const { data: projects }  = useApi('/projects');
  const { data: suppliers } = useApi('/accounting/suppliers');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ project_id: '', category: '', description: '', amount: '', date: '', supplier_id: '', receipt_ref: '' });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const handleCreate = async () => {
    try {
      setSaving(true);
      await apiCall('/accounting/expenses', 'POST', form);
      setShowCreate(false);
      setForm({ project_id: '', category: '', description: '', amount: '', date: '', supplier_id: '', receipt_ref: '' });
      refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await apiCall(`/accounting/expenses/${id}`, 'DELETE');
    refetch();
  };

  const filtered = expenses?.filter(e => filterCat === 'all' || e.category === filterCat) ?? [];
  const total = filtered.reduce((s,e) => s + parseFloat(e.amount||0), 0);

  if (loading) return <div className="loading"><div className="spinner" /> Loading expenses…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Expenses</h1><p className="page-subtitle">Track all project and company expenses</p></div>
        <div className="page-header-actions">
          <div className="total-badge">
            <span className="total-badge-label">Total: </span>
            <span className="total-badge-value">{formatCurrency(total)}</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add Expense</button>
        </div>
      </div>

      <div className="filters-bar">
        <button onClick={() => setFilterCat('all')} className={`btn btn-sm ${filterCat === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All</button>
        {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCat(c)} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-secondary'} cap`}>{c}</button>)}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Description</th><th>Category</th><th>Project</th><th>Date</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={6} className="pd-empty-cell">No expenses found</td></tr>}
            {filtered.map(exp => (
              <tr key={exp.id}>
                <td className="td-medium">{exp.description}</td>
                <td><span className="badge badge-orange cap">{exp.category}</span></td>
                <td className="td-secondary">{exp.project_name || '—'}</td>
                <td className="td-secondary">{formatDate(exp.date)}</td>
                <td className="td-bold">{formatCurrency(exp.amount)}</td>
                <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(exp.id)}><Trash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Expense"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Add Expense'}</button></>}>
        <div className="form-group"><label className="form-label">Description <span className="req">*</span></label><input className="form-input" placeholder="e.g. Truck rental" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Category <span className="req">*</span></label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="opt-capitalize">{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Amount ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Project</label>
            <select className="form-select" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
              <option value="">No project</option>
              {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Date <span className="req">*</span></label><input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
        </div>
      </Modal>
    </div>
  );
}
