const { pool } = require('../db/connection');

exports.getClients = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*,
        COUNT(DISTINCT p.id) AS project_count,
        COUNT(DISTINCT i.id) AS invoice_count
      FROM clients c
      LEFT JOIN projects p ON p.client_id=c.id
      LEFT JOIN invoices i ON i.client_id=c.id
      GROUP BY c.id ORDER BY c.name
    `);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.getClientById = async (req, res, next) => {
  try {
    const [client] = await pool.query('SELECT * FROM clients WHERE id=?', [req.params.id]);
    if (!client.length) return res.status(404).json({ success: false, message: 'Client not found' });
    const [projects] = await pool.query('SELECT * FROM projects WHERE client_id=? ORDER BY created_at DESC', [req.params.id]);
    const [comms]    = await pool.query('SELECT * FROM communications WHERE client_id=? ORDER BY date DESC', [req.params.id]);
    res.json({ success: true, data: { ...client[0], projects, communications: comms } });
  } catch(err) { next(err); }
};

exports.createClient = async (req, res, next) => {
  try {
    const { name, company, email, phone, address, city, country, notes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO clients (name,company,email,phone,address,city,country,notes) VALUES (?,?,?,?,?,?,?,?)`,
      [name, company, email, phone, address, city, country||'Lebanon', notes]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { name, company, email, phone, address, city, country, notes } = req.body;
    await pool.query(
      `UPDATE clients SET name=?,company=?,email=?,phone=?,address=?,city=?,country=?,notes=? WHERE id=?`,
      [name, company, email, phone, address, city, country, notes, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM clients WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.deleteClient = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM clients WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Client deleted' });
  } catch(err) { next(err); }
};

exports.getLeads = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];
    if (req.query.status) { params.push(req.query.status); query += ' AND status=?'; }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, source, notes, assigned_to } = req.body;
    const [result] = await pool.query(
      `INSERT INTO leads (name,company,email,phone,source,notes,assigned_to) VALUES (?,?,?,?,?,?,?)`,
      [name, company, email, phone, source, notes, assigned_to]
    );
    const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, source, status, notes, assigned_to } = req.body;
    await pool.query(
      `UPDATE leads SET name=?,company=?,email=?,phone=?,source=?,status=?,notes=?,assigned_to=? WHERE id=?`,
      [name, company, email, phone, source, status, notes, assigned_to, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM leads WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.convertLead = async (req, res, next) => {
  try {
    const [lead] = await pool.query('SELECT * FROM leads WHERE id=?', [req.params.id]);
    if (!lead.length) return res.status(404).json({ success: false, message: 'Lead not found' });
    const { name, company, email, phone } = lead[0];
    const [result] = await pool.query(
      `INSERT INTO clients (name,company,email,phone) VALUES (?,?,?,?)`,
      [name, company, email, phone]
    );
    await pool.query('UPDATE leads SET status=? WHERE id=?', ['converted', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM clients WHERE id=?', [result.insertId]);
    res.json({ success: true, data: rows[0], message: 'Lead converted to client' });
  } catch(err) { next(err); }
};

exports.getQuotations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT q.*, c.name AS client_name
      FROM quotations q LEFT JOIN clients c ON q.client_id=c.id
      ORDER BY q.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.createQuotation = async (req, res, next) => {
  try {
    const { client_id, lead_id, title, description, amount, valid_until } = req.body;
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS count FROM quotations');
    const num = String(parseInt(countRow.count)+1).padStart(4,'0');
    const quote_number = `QT-${new Date().getFullYear()}-${num}`;
    const [result] = await pool.query(
      `INSERT INTO quotations (quote_number,client_id,lead_id,title,description,amount,valid_until) VALUES (?,?,?,?,?,?,?)`,
      [quote_number, client_id||null, lead_id||null, title, description, amount, valid_until||null]
    );
    const [rows] = await pool.query('SELECT * FROM quotations WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateQuotationStatus = async (req, res, next) => {
  try {
    await pool.query('UPDATE quotations SET status=? WHERE id=?', [req.body.status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM quotations WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.getCommunications = async (req, res, next) => {
  try {
    let query = `SELECT cm.*, c.name AS client_name FROM communications cm LEFT JOIN clients c ON cm.client_id=c.id WHERE 1=1`;
    const params = [];
    if (req.query.client_id) { params.push(req.query.client_id); query += ' AND cm.client_id=?'; }
    if (req.query.lead_id)   { params.push(req.query.lead_id);   query += ' AND cm.lead_id=?'; }
    query += ' ORDER BY cm.date DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.addCommunication = async (req, res, next) => {
  try {
    const { client_id, lead_id, type, summary, date, created_by } = req.body;
    const [result] = await pool.query(
      `INSERT INTO communications (client_id,lead_id,type,summary,date,created_by) VALUES (?,?,?,?,?,?)`,
      [client_id||null, lead_id||null, type, summary, date||new Date(), created_by]
    );
    const [rows] = await pool.query('SELECT * FROM communications WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};