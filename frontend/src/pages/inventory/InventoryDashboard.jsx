import React from 'react';
import { useApi } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { Package, AlertTriangle, Warehouse, ArrowRightLeft } from 'lucide-react';
import '../../styles/custom.css';

export default function InventoryDashboard() {
  const { data: items,    loading } = useApi('/inventory/items');
  const { data: lowStock }          = useApi('/inventory/items/low-stock');

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const totalValue  = items?.reduce((s,i) => s + parseFloat(i.unit_cost||0) * parseInt(i.quantity_available||0), 0) || 0;
  const inWarehouse = items?.filter(i => i.location === 'warehouse').length || 0;

  const catMap = {};
  items?.forEach(i => {
    if (!catMap[i.category]) catMap[i.category] = { count:0, value:0 };
    catMap[i.category].count += parseInt(i.quantity_available||0);
    catMap[i.category].value += parseFloat(i.unit_cost||0) * parseInt(i.quantity_available||0);
  });

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Inventory Overview</h1><p className="page-subtitle">Scaffolding materials and equipment status</p></div>
      </div>

      <div className="stat-grid">
        {[
          { icon: Package,        label:'Total Item Types',  value: items?.length || 0,         color:'var(--accent)', bg:'rgba(59,130,246,0.12)' },
          { icon: AlertTriangle,  label:'Low Stock Alerts',  value: lowStock?.length || 0,       color:'var(--red)',    bg:'var(--red-bg)' },
          { icon: Warehouse,      label:'In Warehouse',      value: inWarehouse,                 color:'var(--blue)',   bg:'var(--blue-bg)' },
          { icon: ArrowRightLeft, label:'Total Stock Value', value: formatCurrency(totalValue),  color:'var(--green)',  bg:'var(--green-bg)' },
        ].map((s,i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background:s.bg,color:s.color}}><s.icon size={20}/></div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Stock by Category</span></div>
          {!Object.keys(catMap).length ? <div className="empty-state">No items</div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Category</th><th>Total Units</th><th>Value</th></tr></thead>
                <tbody>
                  {Object.entries(catMap).sort((a,b) => b[1].value - a[1].value).map(([cat, data]) => (
                    <tr key={cat}>
                      <td className="td-medium-cap">{cat}</td>
                      <td className="td-bold">{data.count.toLocaleString()}</td>
                      <td className="td-accent-bold">{formatCurrency(data.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Low Stock Alerts</span></div>
          {!lowStock?.length ? (
            <div className="empty-state empty-state-ok">✓ All items adequately stocked</div>
          ) : (
            <div className="low-stock-list">
              {lowStock.map(item => (
                <div key={item.id} className="low-stock-item">
                  <div><div className="low-stock-name">{item.name}</div><div className="low-stock-cat">{item.category}</div></div>
                  <div className="low-stock-right"><div className="low-stock-qty">{item.quantity_available} left</div><div className="low-stock-reorder">reorder at {item.reorder_level}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
