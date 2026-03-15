import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatDate, statusBadgeClass, capitalize } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, ArrowRight } from 'lucide-react';
import PhoneInput from '../../components/shared/PhoneInput';
import '../../styles/custom.css';

const STAGES = ['new','contacted','qualified','lost','converted'];
const EMPTY  = { name:'', company:'', email:'', phone:'', source:'', status:'new', notes:'', assigned_to:'' };

export default function Leads() {
  const { data: leads, loading, refetch } = useApi('/crm/leads');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [filterStatus, setFilter]   = useState('all');

  const handleCreate = async () => {
    try {
      setSaving(true);
      await apiCall('/crm/leads', 'POST', form);
      setShowModal(false); setForm(EMPTY); refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const lead = leads.find(l => l.id === id);
    await apiCall(`/crm/leads/${id}`, 'PUT', { ...lead, status });
    refetch();
  };

  const convertToClient = async (id) => {
    if (!confirm('Convert this lead to a client?')) return;
    await apiCall(`/crm/leads/${id}/convert`, 'POST');
    refetch();
  };

  const counts = {};
  leads?.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
  const filtered = leads?.filter(l => filterStatus === 'all' || l.status === filterStatus) ?? [];

  if (loading) return <div className="loading"><div className="spinner" /> Loading leads…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Leads</h1><p className="page-subtitle">Track and manage sales pipeline</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setShowModal(true); }}><Plus size={15} /> Add Lead</button>
      </div>

      <div className="pipeline">
        {STAGES.map(s => (
          <div key={s} className="pipeline-stage" style={{ borderTop:`3px solid ${s==='new'?'var(--blue)':s==='contacted'?'var(--accent)':s==='qualified'?'var(--purple)':s==='converted'?'var(--green)':'var(--red)'}` }}>
            <div className="pipeline-stage-label">{s}</div>
            <div className="pipeline-stage-count">{counts[s] || 0}</div>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        <button onClick={() => setFilter('all')} className={`btn btn-sm ${filterStatus==='all'?'btn-primary':'btn-secondary'}`}>All</button>
        {STAGES.map(s => <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filterStatus===s?'btn-primary':'btn-secondary'} cap`}>{s}</button>)}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Company</th><th>Source</th><th>Assigned To</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={7} className="pd-empty-cell">No leads found</td></tr>}
            {filtered.map(l => (
              <tr key={l.id}>
                <td><div className="cell-name-bold">{l.name}</div>{l.email && <div className="cell-sub">{l.email}</div>}</td>
                <td className="td-secondary">{l.company || '—'}</td>
                <td className="td-secondary-cap">{l.source || '—'}</td>
                <td className="td-secondary">{l.assigned_to || '—'}</td>
                <td className="td-secondary">{formatDate(l.created_at)}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>
                  <div className="action-cell">
                    {!['converted','lost'].includes(l.status) && (
                      <select className="form-select select-inline" value={l.status} onChange={e => updateStatus(l.id, e.target.value)}>
                        {STAGES.map(s => <option key={s} value={s} className="opt-capitalize">{s}</option>)}
                      </select>
                    )}
                    {l.status === 'qualified' && (
                      <button className="btn btn-sm btn-ghost" onClick={() => convertToClient(l.id)} title="Convert to Client"><ArrowRight size={13}/></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Lead"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Saving…':'Add Lead'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => setForm({...form, company:e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><PhoneInput value={form.phone} onChange={val => setForm({...form, phone: val})} /></div>
          <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-input" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Source <span className="req">*</span></label>
            <select className="form-select" value={form.source} onChange={e => setForm({...form, source:e.target.value})}>
              <option value="">Select…</option>
              {['referral','website','cold call','social media','tender','other'].map(s => <option key={s} value={s} className="opt-capitalize">{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Assigned To</label><input className="form-input" value={form.assigned_to} onChange={e => setForm({...form, assigned_to:e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} /></div>
      </Modal>
    </div>
  );
}
