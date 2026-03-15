import React from 'react';
import { useApi } from '../../hooks/useApi';
import { formatCurrency, formatDate, statusBadgeClass, capitalize } from '../../utils/formatters';
import { FolderKanban, Users, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../../styles/custom.css';

export default function ProjectsDashboard() {
  const { data: projects, loading } = useApi('/projects');
  const { data: workers }           = useApi('/projects/workers/list');

  if (loading) return <div className="loading"><div className="spinner" /> Loading…</div>;

  const statusMap = {};
  projects?.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });

  const totalRevenue = projects?.reduce((s,p) => s + parseFloat(p.contract_value||0), 0) || 0;
  const totalCost    = projects?.reduce((s,p) => s + parseFloat(p.actual_cost||0), 0) || 0;
  const available    = workers?.filter(w => w.status === 'available').length || 0;
  const onSite       = workers?.filter(w => w.status === 'on_project').length || 0;

  const chartData = [
    { name:'Planning',  count: statusMap['planning']  || 0 },
    { name:'Active',    count: statusMap['active']    || 0 },
    { name:'On Hold',   count: statusMap['on_hold']   || 0 },
    { name:'Completed', count: statusMap['completed'] || 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Projects Overview</h1><p className="page-subtitle">Scaffolding projects and field operations</p></div>
      </div>

      <div className="stat-grid">
        {[
          { icon: FolderKanban, label:'Active Projects',   value: statusMap['active']   || 0, color:'var(--accent)', bg:'rgba(59,130,246,0.12)' },
          { icon: Clock,        label:'In Planning',       value: statusMap['planning'] || 0, color:'var(--blue)',   bg:'var(--blue-bg)' },
          { icon: CheckCircle,  label:'Completed',         value: statusMap['completed']|| 0, color:'var(--green)',  bg:'var(--green-bg)' },
          { icon: Users,        label:'Workers on Site',   value: onSite,                     color:'var(--purple)', bg:'var(--purple-bg)' },
          { icon: Users,        label:'Available Workers', value: available,                  color:'var(--green)',  bg:'var(--green-bg)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background:s.bg,color:s.color}}><s.icon size={20}/></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Projects by Status</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8}} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Financial Summary</span></div>
          <div className="fin-list">
            {[
              { label:'Total Contract Value', value: totalRevenue,              color:'var(--green)' },
              { label:'Total Actual Cost',    value: totalCost,                 color:'var(--red)' },
              { label:'Gross Margin',         value: totalRevenue - totalCost,  color: totalRevenue-totalCost >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map(item => (
              <div key={item.label} className="fin-row">
                <span className="fin-label">{item.label}</span>
                <span className="fin-value" style={{ color: item.color }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
