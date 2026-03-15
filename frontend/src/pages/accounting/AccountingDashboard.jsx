import React from 'react';
import { useApi } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import '../../styles/custom.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AccountingDashboard() {
  const { data: plData }   = useApi('/accounting/reports/profit-loss');
  const { data: invoices } = useApi('/accounting/invoices');
  const { data: expenses } = useApi('/accounting/expenses');

  const chartData = MONTHS.map((month, i) => {
    const rev = plData?.revenue?.find(r => parseInt(r.month) === i + 1);
    const exp = plData?.expenses?.find(e => parseInt(e.month) === i + 1);
    return { month, Revenue: parseFloat(rev?.total || 0), Expenses: parseFloat(exp?.total || 0) };
  });

  const totalRevenue  = invoices?.filter(i => i.status === 'paid').reduce((s,i) => s + parseFloat(i.total_amount||0), 0) || 0;
  const totalExpenses = expenses?.reduce((s,e) => s + parseFloat(e.amount||0), 0) || 0;
  const netProfit     = totalRevenue - totalExpenses;
  const outstanding   = invoices?.filter(i => i.status !== 'paid').reduce((s,i) => s + parseFloat(i.total_amount||0), 0) || 0;

  const catMap = {};
  expenses?.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.amount || 0); });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Accounting Overview</h1><p className="page-subtitle">Financial summary for {new Date().getFullYear()}</p></div>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Total Revenue',  value: totalRevenue,  icon: TrendingUp,   color: 'var(--green)',  bg: 'var(--green-bg)' },
          { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'var(--red)',    bg: 'var(--red-bg)' },
          { label: 'Net Profit',     value: netProfit,     icon: DollarSign,   color: netProfit >= 0 ? 'var(--green)' : 'var(--red)', bg: netProfit >= 0 ? 'var(--green-bg)' : 'var(--red-bg)' },
          { label: 'Outstanding',    value: outstanding,   icon: Clock,        color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={20} /></div>
            <div className="stat-info"><div className="stat-value">{formatCurrency(s.value)}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue vs Expenses</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Revenue"  fill="var(--green)" radius={[4,4,0,0]} />
              <Bar dataKey="Expenses" fill="var(--red)"   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Expenses by Category</span></div>
          {!catData.length ? <div className="empty-state">No expenses recorded</div> : (
            <div className="cat-list">
              {catData.map(cat => (
                <div key={cat.name}>
                  <div className="cat-row">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-value">{formatCurrency(cat.value)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(cat.value / totalExpenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
