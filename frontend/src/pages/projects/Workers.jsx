import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, Pencil, Users, Briefcase, UserCheck } from 'lucide-react';
import PhoneInput from '../../components/shared/PhoneInput';
import '../../styles/custom.css';

const ROLES = ['foreman','rigger','helper','supervisor','driver','other'];
const EMPTY = { name:'', role:'', phone:'', daily_rate:'', status:'available' };

export default function Workers() {
  const { data: workers, loading, refetch } = useApi('/projects/workers/list');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [filterStatus, setFilter] = useState('all');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (w)  => { setEditing(w);  setForm({...w}); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await apiCall(`/projects/workers/${editing.id}`, 'PUT', form);
      else         await apiCall('/projects/workers', 'POST', form);
      setShowModal(false); refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const filtered  = workers?.filter(w => filterStatus === 'all' || w.status === filterStatus) ?? [];
  const available = workers?.filter(w => w.status === 'available').length  || 0;
  const onProject = workers?.filter(w => w.status === 'on_project').length || 0;
  const off       = workers?.filter(w => w.status === 'off').length        || 0;

  if (loading) return <div className="loading"><div className="spinner" /> Loading workers…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Workers</h1><p className="page-subtitle">Field staff and team management</p></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15}/> Add Worker</button>
      </div>

      <div className="stat-grid mb-24">
        {[
          { icon: Users,     label:'Total Workers',  value: workers?.length || 0, color:'var(--accent)',     bg:'rgba(59,130,246,0.12)' },
          { icon: UserCheck, label:'Available',      value: available,            color:'var(--green)',      bg:'var(--green-bg)' },
          { icon: Briefcase, label:'On Project',     value: onProject,            color:'var(--blue)',       bg:'var(--blue-bg)' },
          { icon: Users,     label:'Off / Inactive', value: off,                  color:'var(--text-muted)', bg:'var(--bg-hover)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background:s.bg,color:s.color}}><s.icon size={20}/></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        {['all','available','on_project','off'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filterStatus===s?'btn-primary':'btn-secondary'} cap`}>{s.replace('_',' ')}</button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Daily Rate</th><th>Active Projects</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={7} className="pd-empty-cell">No workers found</td></tr>}
            {filtered.map(w => (
              <tr key={w.id}>
                <td className="td-bold">{w.name}</td>
                <td className="td-secondary-cap">{w.role || '—'}</td>
                <td className="td-secondary">{w.phone || '—'}</td>
                <td className="td-bold">{formatCurrency(w.daily_rate)}<span className="td-rate-suffix">/day</span></td>
                <td>{parseInt(w.active_projects) > 0 ? <span className="badge badge-blue">{w.active_projects}</span> : <span className="td-muted">—</span>}</td>
                <td><StatusBadge status={w.status} /></td>
                <td><button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(w)}><Pencil size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Worker' : 'Add Worker'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Role <span className="req">*</span></label>
            <select className="form-select" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
              <option value="">Select role…</option>
              {ROLES.map(r => <option key={r} value={r} className="opt-capitalize">{r}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><PhoneInput value={form.phone} onChange={val => setForm({...form, phone: val})} /></div>
          <div className="form-group"><label className="form-label">Daily Rate ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0" value={form.daily_rate} onChange={e => setForm({...form, daily_rate:e.target.value})} /></div>
        </div>
        {editing && (
          <div className="form-group"><label className="form-label">Status <span className="req">*</span></label>
            <select className="form-select" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
              {['available','on_project','off'].map(s => <option key={s} value={s} className="opt-capitalize">{s.replace('_',' ')}</option>)}
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}
