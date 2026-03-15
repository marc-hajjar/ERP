const { pool } = require('../db/connection');

exports.getInvoices = async (req, res, next) => {
  try {
    let query = `SELECT i.*, c.name AS client_name, p.name AS project_name
                 FROM invoices i
                 LEFT JOIN clients c ON i.client_id=c.id
                 LEFT JOIN projects p ON i.project_id=p.id
                 WHERE 1=1`;
    const params = [];
    if (req.query.status)    { params.push(req.query.status);    query += ` AND i.status=?`; }
    if (req.query.client_id) { params.push(req.query.client_id); query += ` AND i.client_id=?`; }
    query += ' ORDER BY i.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT i.*, c.name AS client_name, p.name AS project_name
      FROM invoices i LEFT JOIN clients c ON i.client_id=c.id LEFT JOIN projects p ON i.project_id=p.id
      WHERE i.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const { project_id, client_id, amount, tax_amount, due_date, notes } = req.body;
    const total = parseFloat(amount||0) + parseFloat(tax_amount||0);
    const [[countRow]] = await pool.query('SELECT COUNT(*) AS count FROM invoices');
    const num = String(parseInt(countRow.count)+1).padStart(4,'0');
    const invoice_number = `INV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${num}`;
    const [result] = await pool.query(
      `INSERT INTO invoices (invoice_number,project_id,client_id,amount,tax_amount,total_amount,due_date,notes) VALUES (?,?,?,?,?,?,?,?)`,
      [invoice_number, project_id||null, client_id||null, amount, tax_amount||0, total, due_date||null, notes]
    );
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status, paid_date } = req.body;
    await pool.query('UPDATE invoices SET status=?, paid_date=? WHERE id=?', [status, paid_date||null, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.getExpenses = async (req, res, next) => {
  try {
    let query = `SELECT e.*, p.name AS project_name, s.name AS supplier_name
                 FROM expenses e LEFT JOIN projects p ON e.project_id=p.id LEFT JOIN suppliers s ON e.supplier_id=s.id
                 WHERE 1=1`;
    const params = [];
    if (req.query.project_id) { params.push(req.query.project_id); query += ` AND e.project_id=?`; }
    if (req.query.category)   { params.push(req.query.category);   query += ` AND e.category=?`; }
    query += ' ORDER BY e.date DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { project_id, category, description, amount, date, supplier_id, receipt_ref } = req.body;
    const [result] = await pool.query(
      `INSERT INTO expenses (project_id,category,description,amount,date,supplier_id,receipt_ref) VALUES (?,?,?,?,?,?,?)`,
      [project_id||null, category, description, amount, date||new Date(), supplier_id||null, receipt_ref]
    );
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Expense deleted' });
  } catch(err) { next(err); }
};

exports.getPayments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT p.*, i.invoice_number, i.total_amount AS invoice_total, c.name AS client_name
      FROM payments p JOIN invoices i ON p.invoice_id=i.id LEFT JOIN clients c ON i.client_id=c.id
      ORDER BY p.payment_date DESC`);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const { invoice_id, amount, payment_date, method, reference, notes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO payments (invoice_id,amount,payment_date,method,reference,notes) VALUES (?,?,?,?,?,?)`,
      [invoice_id, amount, payment_date||new Date(), method, reference, notes]
    );
    const [[totals]]  = await pool.query('SELECT SUM(amount) as paid FROM payments WHERE invoice_id=?', [invoice_id]);
    const [[invoice]] = await pool.query('SELECT total_amount FROM invoices WHERE id=?', [invoice_id]);
    const totalPaid   = parseFloat(totals.paid||0);
    const invTotal    = parseFloat(invoice?.total_amount||0);
    const newStatus   = totalPaid >= invTotal ? 'paid' : 'partial';
    await pool.query('UPDATE invoices SET status=? WHERE id=?', [newStatus, invoice_id]);
    const [rows] = await pool.query('SELECT * FROM payments WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0], invoice_status: newStatus });
  } catch(err) { next(err); }
};

exports.getSuppliers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact, email, phone, address, category, notes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO suppliers (name,contact,email,phone,address,category,notes) VALUES (?,?,?,?,?,?,?)`,
      [name, contact, email, phone, address, category, notes]
    );
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const { name, contact, email, phone, address, category, notes } = req.body;
    await pool.query(
      `UPDATE suppliers SET name=?,contact=?,email=?,phone=?,address=?,category=?,notes=? WHERE id=?`,
      [name, contact, email, phone, address, category, notes, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM suppliers WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Supplier deleted' });
  } catch(err) { next(err); }
};

exports.getProfitLoss = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [revenue]  = await pool.query(`SELECT MONTH(paid_date) AS month, SUM(total_amount) AS total FROM invoices WHERE status='paid' AND YEAR(paid_date)=? GROUP BY month ORDER BY month`, [year]);
    const [expenses] = await pool.query(`SELECT MONTH(date) AS month, SUM(amount) AS total FROM expenses WHERE YEAR(date)=? GROUP BY month ORDER BY month`, [year]);
    res.json({ success: true, data: { year, revenue, expenses } });
  } catch(err) { next(err); }
};