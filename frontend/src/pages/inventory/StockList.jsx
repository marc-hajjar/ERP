import React, { useState } from 'react';
import { useApi, apiCall } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/shared/Modal';
import { Plus, Pencil, AlertTriangle } from 'lucide-react';
import '../../styles/custom.css';

const CATEGORIES = ['frame','board','coupler','base','ledger','brace','safety','access','other'];
const EMPTY = { name:'', category:'', unit:'pcs', quantity_total:0, reorder_level:10, unit_cost:0, location:'warehouse', notes:'' };

export default function StockList() {
  const { data: items, loading, refetch } = useApi('/inventory/items');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch]       = useState('');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (item) => { setEditing(item); setForm({...item}); setShowModal(true); };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) await apiCall(`/inventory/items/${editing.id}`, 'PUT', form);
      else         await apiCall('/inventory/items', 'POST', form);
      setShowModal(false); refetch();
    } catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  let filtered = items ?? [];
  if (filterCat !== 'all') filtered = filtered.filter(i => i.category === filterCat);
  if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const totalValue = filtered.reduce((s,i) => s + (parseFloat(i.unit_cost||0) * parseInt(i.quantity_available||0)), 0);

  if (loading) return <div className="loading"><div className="spinner" /> Loading inventory…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Stock List</h1><p className="page-subtitle">All scaffolding materials and equipment</p></div>
        <div className="page-header-actions">
          <div className="total-badge">
            <span className="total-badge-label">Stock Value: </span>
            <span className="total-badge-value">{formatCurrency(totalValue)}</span>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Item</button>
        </div>
      </div>

      <div className="filters-bar">
        <input className="search-input" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setFilterCat('all')} className={`btn btn-sm ${filterCat==='all'?'btn-primary':'btn-secondary'}`}>All</button>
        {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCat(c)} className={`btn btn-sm ${filterCat===c?'btn-primary':'btn-secondary'} cap`}>{c}</button>)}
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Item Name</th><th>Category</th><th>Unit</th><th>Total</th><th>Available</th><th>Reorder At</th><th>Unit Cost</th><th>Location</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={10} className="pd-empty-cell">No items found</td></tr>}
            {filtered.map(item => {
              const isLow = parseInt(item.quantity_available) <= parseInt(item.reorder_level);
              return (
                <tr key={item.id}>
                  <td><div className="item-name-flex">{isLow && <AlertTriangle size={13} color="var(--red)" />}<span className="td-medium">{item.name}</span></div></td>
                  <td><span className="badge badge-gray cap">{item.category}</span></td>
                  <td className="td-secondary">{item.unit}</td>
                  <td className="td-bold">{item.quantity_total}</td>
                  <td className="td-bold" style={{ color: isLow ? 'var(--red)' : 'var(--green)' }}>{item.quantity_available}</td>
                  <td className="td-muted">{item.reorder_level}</td>
                  <td>{formatCurrency(item.unit_cost)}</td>
                  <td className="td-secondary-cap">{item.location}</td>
                  <td>{isLow ? <span className="badge badge-red">Low Stock</span> : <span className="badge badge-green">OK</span>}</td>
                  <td><button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(item)}><Pencil size={13}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Item' : 'Add Item'} size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Item Name <span className="req">*</span></label><input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Category <span className="req">*</span></label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c} className="opt-capitalize">{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Unit <span className="req">*</span></label>
            <select className="form-select" value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}>
              {['pcs','meter','set','kg','roll'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Total Quantity <span className="req">*</span></label><input className="form-input" type="number" value={form.quantity_total} onChange={e => setForm({...form, quantity_total:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Reorder Level <span className="req">*</span></label><input className="form-input" type="number" value={form.reorder_level} onChange={e => setForm({...form, reorder_level:e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Unit Cost ($) <span className="req">*</span></label><input className="form-input" type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({...form, unit_cost:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Location <span className="req">*</span></label>
            <select className="form-select" value={form.location} onChange={e => setForm({...form, location:e.target.value})}>
              {['warehouse','site','maintenance','other'].map(l => <option key={l} value={l} className="opt-capitalize">{l}</option>)}
            </select>
          </div>
        </div>
        {editing && <div className="form-group"><label className="form-label">Available Quantity <span className="req">*</span></label><input className="form-input" type="number" value={form.quantity_available} onChange={e => setForm({...form, quantity_available:e.target.value})} /></div>}
      </Modal>
    </div>
  );
}
