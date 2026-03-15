import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import Modal from '../../components/shared/Modal';
import { Plus, Pencil, Trash2, Building2, Phone, Mail } from 'lucide-react';
import PhoneInput from '../../components/shared/PhoneInput';
import '../../styles/custom.css';

const EMPTY = { name:'', company:'', email:'', phone:'', address:'', city:'', country:'Lebanon', notes:'' };

export default function Clients() {
  const { data: clients, loading, refetch } = useApi('/crm/clients');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [search, setSearch]       = useState('');
  const [saving, setSaving]       = useState(false);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (c)  => { setEditing(c);  setForm({...c}); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await apiCall(`/crm/clients/${editing.id}`, 'PUT', form);
      else         await apiCall('/crm/clients', 'POST', form);
      setShowModal(false);
      refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return;
    await apiCall(`/crm/clients/${id}`, 'DELETE');
    refetch();
  };

  const filtered = clients?.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (loading) return <div className="loading"><div className="spinner" /> Loading clients…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Clients</h1><p className="page-subtitle">Manage your client database</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Client</button>
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        <span className="filter-count">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>City</th><th>Projects</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={6} className="pd-empty-cell">No clients found</td></tr>}
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="td-bold">{c.name}</td>
                <td>{c.company ? <span className="company-cell"><Building2 size={12}/>{c.company}</span> : '—'}</td>
                <td>
                  <div className="contact-cell">
                    {c.phone && <span className="contact-row"><Phone size={11}/>{c.phone}</span>}
                    {c.email && <span className="contact-row"><Mail size={11}/>{c.email}</span>}
                  </div>
                </td>
                <td className="td-secondary">{c.city || '—'}</td>
                <td><span className="badge badge-blue">{c.project_count || 0}</span></td>
                <td>
                  <div className="action-cell">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)}><Pencil size={13}/></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Client' : 'Add Client'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><PhoneInput value={form.phone} onChange={val => setForm({...form, phone: val})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">City <span className="req">*</span></label><input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Country <span className="req">*</span></label><input className="form-input" value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
    </div>
  );
}
