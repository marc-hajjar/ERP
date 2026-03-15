const { pool } = require('../db/connection');

module.exports = async (req, res, next) => {
  try {
    const [[projectStats]] = await pool.query(`SELECT status, COUNT(*) AS count FROM projects GROUP BY status`);
    const [[invoiceStats]] = await pool.query(`
      SELECT
        SUM(CASE WHEN status='unpaid'  THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) AS overdue_count,
        COALESCE(SUM(CASE WHEN status IN ('unpaid','overdue') THEN total_amount ELSE 0 END),0) AS outstanding_amount,
        COALESCE(SUM(CASE WHEN status='paid' THEN total_amount ELSE 0 END),0) AS collected_amount
      FROM invoices
    `);
    const [[lowStock]]     = await pool.query(`SELECT COUNT(*) AS count FROM inventory_items WHERE quantity_available <= reorder_level`);
    const [[leadStats]]    = await pool.query(`SELECT status, COUNT(*) AS count FROM leads GROUP BY status`);
    const [recentProjects] = await pool.query(`SELECT p.*, c.name AS client_name FROM projects p LEFT JOIN clients c ON p.client_id=c.id ORDER BY p.created_at DESC LIMIT 5`);
    const [recentInvoices] = await pool.query(`SELECT i.*, c.name AS client_name FROM invoices i LEFT JOIN clients c ON i.client_id=c.id ORDER BY i.created_at DESC LIMIT 5`);

    const projectMap = {};
    (Array.isArray(projectStats) ? projectStats : [projectStats]).forEach(r => { if(r && r.status) projectMap[r.status] = parseInt(r.count); });

    const leadMap = {};
    (Array.isArray(leadStats) ? leadStats : [leadStats]).forEach(r => { if(r && r.status) leadMap[r.status] = parseInt(r.count); });

    res.json({
      success: true,
      data: {
        projects: {
          active:    projectMap['active']    || 0,
          planning:  projectMap['planning']  || 0,
          completed: projectMap['completed'] || 0,
          on_hold:   projectMap['on_hold']   || 0,
          total: Object.values(projectMap).reduce((a, b) => a + b, 0)
        },
        invoices: Array.isArray(invoiceStats) ? invoiceStats[0] : invoiceStats,
        low_stock_count: parseInt(lowStock.count || 0),
        leads: {
          new:       leadMap['new']       || 0,
          contacted: leadMap['contacted'] || 0,
          qualified: leadMap['qualified'] || 0,
          total: Object.values(leadMap).reduce((a, b) => a + b, 0)
        },
        recent_projects: recentProjects,
        recent_invoices: recentInvoices,
      }
    });
  } catch (err) { next(err); }
};