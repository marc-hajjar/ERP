import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency, formatDate, statusBadgeClass, capitalize } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import { Plus, ExternalLink } from 'lucide-react';
import '../../styles/custom.css';

const STATUSES = ['planning','active','on_hold','completed','cancelled'];
const EMPTY = { name:'', client_id:'', description:'', location:'', start_date:'', end_date:'', contract_value:'', estimated_cost:'', notes:'' };

export default function ProjectList() {
  const navigate = useNavigate();
  const { data: projects, loading, refetch } = useApi('/projects');
  const { data: clients }    = useApi('/crm/clients');
  const { data: quotations } = useApi('/crm/quotations');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [filterStatus, setFilter]   = useState('all');
  const [search, setSearch]         = useState('');

  const handleCreate = async () => {
    try {
      setSaving(true);
      const created = await apiCall('/projects', 'POST', form);
      setShowCreate(false); setForm(EMPTY); refetch();
      if (created?.data?.id) navigate(`/projects/${created.data.id}`);
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const updateStatus = async (e, id, row) => {
    e.stopPropagation();
    await apiCall(`/projects/${id}`, 'PUT', { ...row, status: e.target.value });
    refetch();
  };

  let filtered = projects ?? [];
  if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.project_number?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading"><div className="spinner" /> Loading projects…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">All Projects</h1><p className="page-subtitle">{projects?.length || 0} total projects</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setShowCreate(true); }}><Plus size={15} /> New Project</button>
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setFilter('all')} className={`btn btn-sm ${filterStatus==='all'?'btn-primary':'btn-secondary'}`}>All</button>
        {STATUSES.map(s => <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filterStatus===s?'btn-primary':'btn-secondary'} cap`}>{s.replace('_',' ')}</button>)}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Project</th><th>Client</th><th>Location</th><th>Start</th><th>End</th><th>Contract Value</th><th>Workers</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={9} className="pd-empty-cell">No projects found</td></tr>}
            {filtered.map(p => (
              <tr key={p.id} className="tr-clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                <td><div className="cell-name-bold">{p.name}</div><div className="cell-sub-accent">{p.project_number}</div></td>
                <td className="td-secondary">{p.client_name || '—'}</td>
                <td className="td-secondary">{p.location || '—'}</td>
                <td className="td-secondary">{formatDate(p.start_date)}</td>
                <td className="td-secondary">{formatDate(p.end_date)}</td>
                <td className="td-bold">{formatCurrency(p.contract_value)}</td>
                <td><span className="badge badge-blue">{p.worker_count || 0}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <select className="form-select select-inline" value={p.status} onChange={e => updateStatus(e, p.id, p)}>
                    {STATUSES.map(s => <option key={s} value={s} className="opt-capitalize">{s.replace('_',' ')}</option>)}
                  </select>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate(`/projects/${p.id}`)}><ExternalLink size={13}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Creating…':'Create Project'}</button></>}>
        <div className="form-group"><label className="form-label">Project Name <span className="req">*</span></label><input className="form-input" placeholder="e.g. Al Hamra Tower Scaffolding" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Client <span className="req">*</span></label>
            <select className="form-select" value={form.client_id} onChange={e => setForm({...form, client_id:e.target.value})}>
              <option value="">Select client…</option>
              {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Linked Quotation</label>
            <select className="form-select" value={form.quotation_id} onChange={e => setForm({...form, quotation_id:e.target.value})}>
              <option value="">None</option>
              {quotations?.filter(q => q.status === 'accepted').map(q => <option key={q.id} value={q.id}>{q.quote_number} — {q.title}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Location / Site Address <span className="req">*</span></label><input className="form-input" placeholder="e.g. Downtown Beirut, Block 5" value={form.location} onChange={e => setForm({...form, location:e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Start Date <span className="req">*</span></label><input className="form-input" type="date" value={form.start_date} onChange={e => setForm({...form, start_date:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date} onChange={e => setForm({...form, end_date:e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Contract Value ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0.00" value={form.contract_value} onChange={e => setForm({...form, contract_value:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Estimated Cost ($) <span className="req">*</span></label><input className="form-input" type="number" placeholder="0.00" value={form.estimated_cost} onChange={e => setForm({...form, estimated_cost:e.target.value})} /></div>
        </div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Scope of work…" value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></div>
      </Modal>
    </div>
  );
}
