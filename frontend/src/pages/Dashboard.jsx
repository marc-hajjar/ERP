import React from 'react';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, statusBadgeClass, capitalize } from '../utils/formatters';
import { FolderKanban, DollarSign, Package, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../styles/custom.css';

export default function Dashboard() {
  const { data, loading } = useApi('/dashboard');

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard…</div>;
  if (!data) return <div className="empty-state">Could not load dashboard data.</div>;

  const { projects, invoices, low_stock_count, leads, recent_projects, recent_invoices } = data;

  const stats = [
    { icon: FolderKanban, label: 'Active Projects',    value: projects.active,                        color: 'var(--accent)',  bg: 'rgba(59,130,246,0.12)' },
    { icon: DollarSign,   label: 'Outstanding',        value: formatCurrency(invoices.outstanding_amount), color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
    { icon: DollarSign,   label: 'Revenue Collected',  value: formatCurrency(invoices.collected_amount),   color: 'var(--green)',  bg: 'var(--green-bg)' },
    { icon: Users,        label: 'Active Leads',       value: leads.new + leads.contacted + leads.qualified, color: 'var(--blue)', bg: 'var(--blue-bg)' },
    { icon: Package,      label: 'Low Stock Alerts',   value: low_stock_count,                        color: low_stock_count > 0 ? 'var(--red)' : 'var(--green)', bg: low_stock_count > 0 ? 'var(--red-bg)' : 'var(--green-bg)' },
  ];

  const projectStatusData = [
    { name: 'Planning',  value: projects.planning },
    { name: 'Active',    value: projects.active },
    { name: 'On Hold',   value: projects.on_hold },
    { name: 'Completed', value: projects.completed },
  ];

  const pipelineData = [
    { stage: 'New',       count: leads.new },
    { stage: 'Contacted', count: leads.contacted },
    { stage: 'Qualified', count: leads.qualified },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">ACHI Scaffolding — ERP Overview</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Project Status</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectStatusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Lead Pipeline</span></div>
          <div className="pipeline-list">
            {pipelineData.map(p => (
              <div key={p.stage}>
                <div className="pipeline-row">
                  <span className="pipeline-row-label">{p.stage}</span>
                  <span className="pipeline-row-count">{p.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (p.count / Math.max(leads.total, 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Projects</span></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Value</th></tr></thead>
              <tbody>
                {!recent_projects?.length && <tr><td colSpan={4} className="pd-empty-cell">No projects yet</td></tr>}
                {recent_projects?.map(p => (
                  <tr key={p.id}>
                    <td><div className="cell-name">{p.name}</div><div className="cell-sub">{p.project_number}</div></td>
                    <td className="td-secondary">{p.client_name || '—'}</td>
                    <td><span className={`badge ${statusBadgeClass(p.status)}`}>{capitalize(p.status)}</span></td>
                    <td>{formatCurrency(p.contract_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Recent Invoices</span></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Invoice</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                {!recent_invoices?.length && <tr><td colSpan={3} className="pd-empty-cell">No invoices yet</td></tr>}
                {recent_invoices?.map(inv => (
                  <tr key={inv.id}>
                    <td><div className="cell-name">{inv.invoice_number}</div><div className="cell-sub">{inv.client_name}</div></td>
                    <td><span className={`badge ${statusBadgeClass(inv.status)}`}>{capitalize(inv.status)}</span></td>
                    <td className="td-bold">{formatCurrency(inv.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {low_stock_count > 0 && (
        <div className="stock-alert-banner">
          <AlertTriangle size={18} color="var(--red)" />
          <span className="stock-alert-text">{low_stock_count} inventory item{low_stock_count > 1 ? 's' : ''} below reorder level.</span>
        </div>
      )}
    </div>
  );
}
