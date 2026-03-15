import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { ArrowLeft, Plus, Trash2, RotateCcw } from 'lucide-react';
import '../../styles/custom.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, loading, refetch } = useApi(`/projects/${id}`);
  const { data: allWorkers } = useApi('/projects/workers/list');
  const { data: allItems }   = useApi('/inventory/items');
  const { data: costSummary} = useApi(`/projects/${id}/cost-summary`);

  const [activeTab, setTab]         = useState('overview');
  const [showAssign, setShowAssign] = useState(false);
  const [showMat, setShowMat]       = useState(false);
  const [workerForm, setWorkerForm] = useState({ worker_id:'', role:'', start_date:'', end_date:'' });
  const [matForm, setMatForm]       = useState({ item_id:'', quantity:1, notes:'' });
  const [saving, setSaving]         = useState(false);

  const handleAssign = async () => {
    try { setSaving(true); await apiCall(`/projects/${id}/workers`, 'POST', workerForm); setShowAssign(false); setWorkerForm({ worker_id:'', role:'', start_date:'', end_date:'' }); refetch(); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleRemoveWorker = async (aid) => {
    if (!confirm('Remove worker?')) return;
    await apiCall(`/projects/assignments/${aid}`, 'DELETE'); refetch();
  };

  const handleAllocate = async () => {
    try { setSaving(true); await apiCall('/inventory/allocate', 'POST', { ...matForm, project_id: id }); setShowMat(false); setMatForm({ item_id:'', quantity:1, notes:'' }); refetch(); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleReturn = async (aid) => {
    if (!confirm('Return items to warehouse?')) return;
    await apiCall(`/inventory/return/${aid}`, 'POST'); refetch();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading project…</div>;
  if (!project) return <div className="empty-state">Project not found.</div>;

  const TABS = ['overview','workers','materials','invoices','expenses'];

  return (
    <div>
      <div className="pd-header">
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects/list')}><ArrowLeft size={16}/></button>
        <div>
          <div className="pd-title-row">
            <h1 className="page-title pd-page-title">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="pd-project-number">{project.project_number}</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${activeTab===t?'active':''}`} onClick={() => setTab(t)}>
            {capitalize(t)}
            {t==='workers'   && project.workers?.length   ? ` (${project.workers.length})`   : ''}
            {t==='materials' && project.materials?.length ? ` (${project.materials.length})` : ''}
            {t==='invoices'  && project.invoices?.length  ? ` (${project.invoices.length})`  : ''}
            {t==='expenses'  && project.expenses?.length  ? ` (${project.expenses.length})`  : ''}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="detail-grid pd-overview-grid">
            {[
              { label:'Client',         value: project.client_name   || '—' },
              { label:'Phone',          value: project.client_phone  || '—' },
              { label:'Location',       value: project.location      || '—' },
              { label:'Start Date',     value: formatDate(project.start_date) },
              { label:'End Date',       value: formatDate(project.end_date) },
              { label:'Contract Value', value: formatCurrency(project.contract_value) },
              { label:'Est. Cost',      value: formatCurrency(project.estimated_cost) },
              { label:'Actual Cost',    value: formatCurrency(project.actual_cost) },
            ].map(item => (
              <div key={item.label} className="card detail-item">
                <label>{item.label}</label>
                <span className="pd-detail-value">{item.value}</span>
              </div>
            ))}
          </div>
          {project.description && (
            <div className="card pd-description-card">
              <div className="detail-section-title">Description</div>
              <p className="pd-description-text">{project.description}</p>
            </div>
          )}
          {costSummary && (
            <div className="card">
              <div className="card-header"><span className="card-title">Cost & Revenue Summary</span></div>
              <div className="pd-cost-summary-grid">
                {[
                  { label:'Material Cost',     value: costSummary.material_cost,   color:'var(--text-primary)' },
                  { label:'Other Expenses',    value: costSummary.total_expenses,  color:'var(--text-primary)' },
                  { label:'Total Cost',        value: costSummary.total_cost,      color:'var(--red)' },
                  { label:'Revenue Collected', value: costSummary.revenue_collected, color:'var(--green)' },
                  { label:'Gross Profit',      value: costSummary.revenue_collected - costSummary.total_cost, color: costSummary.revenue_collected - costSummary.total_cost >= 0 ? 'var(--green)' : 'var(--red)' },
                ].map(item => (
                  <div key={item.label} className="pd-cost-item">
                    <div className="pd-cost-label">{item.label}</div>
                    <div className="pd-cost-value" style={{ color:item.color }}>{formatCurrency(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workers' && (
        <div>
          <div className="pd-tab-header">
            <button className="btn btn-primary" onClick={() => setShowAssign(true)}><Plus size={15}/> Assign Worker</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Daily Rate</th><th>Start</th><th>End</th><th></th></tr></thead>
              <tbody>
                {!project.workers?.length && <tr><td colSpan={7} className="pd-empty-cell">No workers assigned</td></tr>}
                {project.workers?.map(w => (
                  <tr key={w.id}>
                    <td className="td-bold">{w.name}</td>
                    <td className="td-secondary-cap">{w.role || w.worker_role || '—'}</td>
                    <td className="td-secondary">{w.phone || '—'}</td>
                    <td>{formatCurrency(w.daily_rate)}/day</td>
                    <td className="td-secondary">{formatDate(w.start_date)}</td>
                    <td className="td-secondary">{formatDate(w.end_date)}</td>
                    <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => handleRemoveWorker(w.id)}><Trash2 size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Worker"
            footer={<><button className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAssign} disabled={saving}>{saving?'Assigning…':'Assign'}</button></>}>
            <div className="form-group"><label className="form-label">Worker <span className="req">*</span></label>
              <select className="form-select" value={workerForm.worker_id} onChange={e => setWorkerForm({...workerForm, worker_id:e.target.value})}>
                <option value="">Select worker…</option>
                {allWorkers?.filter(w => w.status !== 'on_project').map(w => <option key={w.id} value={w.id}>{w.name} ({w.role})</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Role on Project <span className="req">*</span></label>
              <select className="form-select" value={workerForm.role} onChange={e => setWorkerForm({...workerForm, role:e.target.value})}>
                <option value="">Select…</option>
                {['foreman','rigger','helper','supervisor','driver','other'].map(r => <option key={r} value={r} className="opt-capitalize">{r}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start Date <span className="req">*</span></label><input className="form-input" type="date" value={workerForm.start_date} onChange={e => setWorkerForm({...workerForm, start_date:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={workerForm.end_date} onChange={e => setWorkerForm({...workerForm, end_date:e.target.value})} /></div>
            </div>
          </Modal>
        </div>
      )}

      {activeTab === 'materials' && (
        <div>
          <div className="pd-tab-header">
            <button className="btn btn-primary" onClick={() => setShowMat(true)}><Plus size={15}/> Allocate Materials</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th>Allocated</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {!project.materials?.length && <tr><td colSpan={7} className="pd-empty-cell">No materials allocated</td></tr>}
                {project.materials?.map(m => (
                  <tr key={m.id}>
                    <td className="td-medium">{m.item_name}</td>
                    <td className="td-bold">{m.quantity} {m.unit}</td>
                    <td>{formatCurrency(m.unit_cost)}</td>
                    <td className="td-bold">{formatCurrency(m.total_cost)}</td>
                    <td className="td-secondary">{formatDate(m.allocated_at)}</td>
                    <td>{m.returned_at ? <span className="badge badge-green">Returned</span> : <span className="badge badge-yellow">On Site</span>}</td>
                    <td>{!m.returned_at && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleReturn(m.id)} title="Return to warehouse"><RotateCcw size={13}/></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Modal isOpen={showMat} onClose={() => setShowMat(false)} title="Allocate Materials"
            footer={<><button className="btn btn-secondary" onClick={() => setShowMat(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAllocate} disabled={saving}>{saving?'Allocating…':'Allocate'}</button></>}>
            <div className="form-group"><label className="form-label">Item <span className="req">*</span></label>
              <select className="form-select" value={matForm.item_id} onChange={e => setMatForm({...matForm, item_id:e.target.value})}>
                <option value="">Select item…</option>
                {allItems?.filter(i => i.quantity_available > 0).map(i => <option key={i.id} value={i.id}>{i.name} — {i.quantity_available} available</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Quantity <span className="req">*</span></label><input className="form-input" type="number" min="1" value={matForm.quantity} onChange={e => setMatForm({...matForm, quantity:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Notes</label><input className="form-input" placeholder="Optional" value={matForm.notes} onChange={e => setMatForm({...matForm, notes:e.target.value})} /></div>
          </Modal>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Invoice #</th><th>Amount</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {!project.invoices?.length && <tr><td colSpan={5} className="pd-empty-cell">No invoices for this project</td></tr>}
              {project.invoices?.map(inv => (
                <tr key={inv.id}>
                  <td className="td-accent-bold">{inv.invoice_number}</td>
                  <td className="td-bold">{formatCurrency(inv.total_amount)}</td>
                  <td className="td-secondary">{formatDate(inv.issue_date)}</td>
                  <td className="td-secondary">{formatDate(inv.due_date)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>
              {!project.expenses?.length && <tr><td colSpan={4} className="pd-empty-cell">No expenses for this project</td></tr>}
              {project.expenses?.map(exp => (
                <tr key={exp.id}>
                  <td className="td-medium">{exp.description}</td>
                  <td><span className="badge badge-orange pd-expense-category">{exp.category}</span></td>
                  <td className="td-secondary">{formatDate(exp.date)}</td>
                  <td className="td-bold">{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
              {project.expenses?.length > 0 && (
                <tr className="pd-expense-total-row">
                  <td colSpan={3} className="pd-expense-total-label">Total</td>
                  <td className="pd-expense-total-value">{formatCurrency(project.expenses.reduce((s,e) => s + parseFloat(e.amount||0), 0))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}