import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import Modal from '../../components/shared/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PhoneInput from '../../components/shared/PhoneInput';
import '../../styles/custom.css';

const EMPTY = { name:'', contact:'', email:'', phone:'', address:'', category:'', notes:'' };

export default function Suppliers() {
  const { data: suppliers, loading, refetch } = useApi('/accounting/suppliers');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (s)  => { setEditing(s);  setForm({...s}); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await apiCall(`/accounting/suppliers/${editing.id}`, 'PUT', form);
      else         await apiCall('/accounting/suppliers', 'POST', form);
      setShowModal(false);
      refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    await apiCall(`/accounting/suppliers/${id}`, 'DELETE');
    refetch();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading suppliers…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Suppliers</h1><p className="page-subtitle">Manage your vendors and supply partners</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Supplier</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>
            {!suppliers?.length && <tr><td colSpan={6} className="pd-empty-cell">No suppliers yet</td></tr>}
            {suppliers?.map(s => (
              <tr key={s.id}>
                <td className="td-bold">{s.name}</td>
                <td className="td-secondary">{s.contact || '—'}</td>
                <td className="td-secondary">{s.email || '—'}</td>
                <td className="td-secondary">{s.phone || '—'}</td>
                <td><span className="badge badge-gray cap">{s.category || '—'}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)}><Pencil size={13}/></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Category <span className="req">*</span></label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select…</option>
              {['materials','transport','equipment','services','other'].map(c => <option key={c} value={c} className="opt-capitalize">{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Contact Person <span className="req">*</span></label><input className="form-input" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><PhoneInput value={form.phone} onChange={val => setForm({...form, phone: val})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
        <div className="form-group"><label className="form-label">Address <span className="req">*</span></label><textarea className="form-textarea" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
      </Modal>
    </div>
  );
}
