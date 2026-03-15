import React from 'react';
import { useApi } from '../../hooks/useApi';
import { formatDateTime, statusBadgeClass, capitalize } from '../../utils/formatters';
import { Users, UserPlus, FileText, MessageSquare } from 'lucide-react';
import '../../styles/custom.css';

const STAGES = ['new','contacted','qualified','converted','lost'];
const STAGE_COLORS = { new:'var(--blue)', contacted:'var(--accent)', qualified:'var(--purple)', converted:'var(--green)', lost:'var(--red)' };

export default function CRMDashboard() {
  const { data: clients } = useApi('/crm/clients');
  const { data: leads }   = useApi('/crm/leads');
  const { data: quotes }  = useApi('/crm/quotations');
  const { data: comms }   = useApi('/crm/communications');

  const stageCounts = {};
  leads?.forEach(l => { stageCounts[l.status] = (stageCounts[l.status] || 0) + 1; });
  const totalLeads = leads?.length || 0;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">CRM Overview</h1><p className="page-subtitle">Sales pipeline and client relationship summary</p></div>
      </div>

      <div className="stat-grid">
        {[
          { icon: Users,         label: 'Total Clients',   value: clients?.length || 0,  color: 'var(--blue)',   bg: 'var(--blue-bg)' },
          { icon: UserPlus,      label: 'Active Leads',    value: leads?.filter(l => !['converted','lost'].includes(l.status)).length || 0, color: 'var(--accent)', bg: 'rgba(59,130,246,0.12)' },
          { icon: FileText,      label: 'Open Quotations', value: quotes?.filter(q => ['draft','sent'].includes(q.status)).length || 0, color: 'var(--purple)', bg: 'var(--purple-bg)' },
          { icon: MessageSquare, label: 'Communications',  value: comms?.length || 0,    color: 'var(--green)',  bg: 'var(--green-bg)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg, color:s.color }}><s.icon size={20}/></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card mb-20">
        <div className="card-header"><span className="card-title">Lead Pipeline</span></div>
        <div className="pipeline-stages">
          {STAGES.map(stage => {
            const count = stageCounts[stage] || 0;
            const pct = totalLeads ? (count / totalLeads) * 100 : 0;
            return (
              <div key={stage} className="pipeline-stage-col">
                <div style={{ height:80, background:`${STAGE_COLORS[stage]}22`, border:`1px solid ${STAGE_COLORS[stage]}44`, borderRadius:'var(--radius)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderTop:`3px solid ${STAGE_COLORS[stage]}`, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${pct}%`, background:`${STAGE_COLORS[stage]}22` }}/>
                  <span style={{ fontFamily:'var(--font-heading)', fontWeight:800, fontSize:'1.4rem', color:STAGE_COLORS[stage], position:'relative' }}>{count}</span>
                </div>
                <div className="pipeline-stage-label">{stage}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Clients</span></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Company</th><th>City</th></tr></thead>
              <tbody>
                {!clients?.length && <tr><td colSpan={3} className="pd-empty-cell">No clients yet</td></tr>}
                {clients?.slice(0,6).map(c => (
                  <tr key={c.id}>
                    <td className="td-medium">{c.name}</td>
                    <td className="td-secondary">{c.company || '—'}</td>
                    <td className="td-secondary">{c.city || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Recent Communications</span></div>
          {!comms?.length ? <div className="empty-state">No communications logged</div> : (
            <div className="comm-list">
              {comms.slice(0,6).map(c => (
                <div key={c.id} className="comm-item">
                  <div className="comm-item-header">
                    <span className="comm-sender">{c.client_name || 'Lead'}</span>
                    <span className={`badge badge-xs ${c.type === 'call' ? 'badge-blue' : c.type === 'meeting' ? 'badge-green' : 'badge-gray'}`}>{c.type}</span>
                  </div>
                  <p className="comm-summary">{c.summary?.substring(0,80)}{c.summary?.length > 80 ? '…' : ''}</p>
                  <div className="comm-date">{formatDateTime(c.date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
