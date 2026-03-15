const { pool } = require('../db/connection');

exports.getProjects = async (req, res, next) => {
  try {
    let query = `
      SELECT p.*, c.name AS client_name,
        COUNT(DISTINCT pw.worker_id) AS worker_count,
        COUNT(DISTINCT pm.id) AS material_count
      FROM projects p
      LEFT JOIN clients c ON p.client_id=c.id
      LEFT JOIN project_workers pw ON pw.project_id=p.id
      LEFT JOIN project_materials pm ON pm.project_id=p.id
      WHERE 1=1`;
    const params = [];
    if (req.query.status)    { params.push(req.query.status);    query += ' AND p.status=?'; }
    if (req.query.client_id) { params.push(req.query.client_id); query += ' AND p.client_id=?'; }
    query += ' GROUP BY p.id, c.name ORDER BY p.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const [project] = await pool.query(`
      SELECT p.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email
      FROM projects p LEFT JOIN clients c ON p.client_id=c.id WHERE p.id=?
    `, [req.params.id]);
    if (!project.length) return res.status(404).json({ success: false, message: 'Project not found' });
    const [workers]   = await pool.query(`SELECT pw.*, w.name, w.role AS worker_role, w.phone, w.daily_rate FROM project_workers pw JOIN workers w ON pw.worker_id=w.id WHERE pw.project_id=?`, [req.params.id]);
    const [materials] = await pool.query(`SELECT pm.*, i.name AS item_name, i.unit, i.unit_cost, (pm.quantity*i.unit_cost) AS total_cost FROM project_materials pm JOIN inventory_items i ON pm.item_id=i.id WHERE pm.project_id=?`, [req.params.id]);
    const [invoices]  = await pool.query('SELECT * FROM invoices WHERE project_id=? ORDER BY created_at DESC', [req.params.id]);
    const [expenses]  = await pool.query('SELECT * FROM expenses WHERE project_id=? ORDER BY date DESC', [req.params.id]);
    res.json({ success: true, data: { ...project[0], workers, materials, invoices, expenses } });
  } catch(err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, client_id, quotation_id, description, location, start_date, end_date, contract_value, estimated_cost, notes } = req.body;
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS count FROM projects');
    const num = String(parseInt(countRow.count)+1).padStart(4,'0');
    const project_number = `PROJ-${new Date().getFullYear()}-${num}`;
    const [result] = await pool.query(
      `INSERT INTO projects (project_number,name,client_id,quotation_id,description,location,start_date,end_date,contract_value,estimated_cost,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [project_number, name, client_id||null, quotation_id||null, description, location, start_date||null, end_date||null, contract_value||0, estimated_cost||0, notes]
    );
    const [rows] = await pool.query('SELECT * FROM projects WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, location, status, start_date, end_date, contract_value, estimated_cost, actual_cost, notes } = req.body;
    await pool.query(
      `UPDATE projects SET name=?,description=?,location=?,status=?,start_date=?,end_date=?,contract_value=?,estimated_cost=?,actual_cost=?,notes=? WHERE id=?`,
      [name, description, location, status, start_date||null, end_date||null, contract_value, estimated_cost, actual_cost, notes, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM projects WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch(err) { next(err); }
};

exports.getWorkers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT w.*, COUNT(pw.id) AS active_projects
      FROM workers w
      LEFT JOIN project_workers pw ON pw.worker_id=w.id
      LEFT JOIN projects p ON pw.project_id=p.id AND p.status='active'
      GROUP BY w.id ORDER BY w.name
    `);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.createWorker = async (req, res, next) => {
  try {
    const { name, role, phone, daily_rate } = req.body;
    const [result] = await pool.query(
      `INSERT INTO workers (name,role,phone,daily_rate) VALUES (?,?,?,?)`,
      [name, role, phone, daily_rate||0]
    );
    const [rows] = await pool.query('SELECT * FROM workers WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateWorker = async (req, res, next) => {
  try {
    const { name, role, phone, daily_rate, status } = req.body;
    await pool.query(
      `UPDATE workers SET name=?,role=?,phone=?,daily_rate=?,status=? WHERE id=?`,
      [name, role, phone, daily_rate, status, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM workers WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.assignWorker = async (req, res, next) => {
  try {
    const { worker_id, role, start_date, end_date } = req.body;
    const [result] = await pool.query(
      `INSERT INTO project_workers (project_id,worker_id,role,start_date,end_date) VALUES (?,?,?,?,?)`,
      [req.params.project_id, worker_id, role, start_date||null, end_date||null]
    );
    await pool.query('UPDATE workers SET status=? WHERE id=?', ['on_project', worker_id]);
    const [rows] = await pool.query('SELECT * FROM project_workers WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.removeWorker = async (req, res, next) => {
  try {
    const [assign] = await pool.query('SELECT * FROM project_workers WHERE id=?', [req.params.assignment_id]);
    if (assign.length) await pool.query('UPDATE workers SET status=? WHERE id=?', ['available', assign[0].worker_id]);
    await pool.query('DELETE FROM project_workers WHERE id=?', [req.params.assignment_id]);
    res.json({ success: true, message: 'Worker removed from project' });
  } catch(err) { next(err); }
};

exports.getProjectCostSummary = async (req, res, next) => {
  try {
    const [[matCost]]  = await pool.query(`SELECT COALESCE(SUM(pm.quantity*i.unit_cost),0) AS total FROM project_materials pm JOIN inventory_items i ON pm.item_id=i.id WHERE pm.project_id=?`, [req.params.id]);
    const [expCost]    = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total, category FROM expenses WHERE project_id=? GROUP BY category`, [req.params.id]);
    const [[revenue]]  = await pool.query(`SELECT COALESCE(SUM(total_amount),0) AS total FROM invoices WHERE project_id=? AND status='paid'`, [req.params.id]);
    const totalExp     = expCost.reduce((s,r) => s+parseFloat(r.total), 0);
    const totalMat     = parseFloat(matCost.total);
    res.json({ success: true, data: { material_cost: totalMat, expense_breakdown: expCost, total_expenses: totalExp, total_cost: totalMat+totalExp, revenue_collected: parseFloat(revenue.total) } });
  } catch(err) { next(err); }
};