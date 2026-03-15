const { pool } = require('../db/connection');

exports.getItems = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params = [];
    if (req.query.category) { params.push(req.query.category); query += ' AND category=?'; }
    if (req.query.location) { params.push(req.query.location); query += ' AND location=?'; }
    query += ' ORDER BY category, name';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};

exports.getItemById = async (req, res, next) => {
  try {
    const [item] = await pool.query('SELECT * FROM inventory_items WHERE id=?', [req.params.id]);
    if (!item.length) return res.status(404).json({ success: false, message: 'Item not found' });
    const [allocations] = await pool.query(`
      SELECT pm.*, p.name AS project_name, p.status AS project_status
      FROM project_materials pm JOIN projects p ON pm.project_id=p.id
      WHERE pm.item_id=? AND pm.returned_at IS NULL
      ORDER BY pm.allocated_at DESC
    `, [req.params.id]);
    res.json({ success: true, data: { ...item[0], allocations } });
  } catch(err) { next(err); }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, category, unit, quantity_total, reorder_level, unit_cost, location, notes } = req.body;
    const qty = quantity_total || 0;
    const [result] = await pool.query(
      `INSERT INTO inventory_items (name,category,unit,quantity_total,quantity_available,reorder_level,unit_cost,location,notes) VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, category, unit, qty, qty, reorder_level||10, unit_cost||0, location||'warehouse', notes]
    );
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { name, category, unit, quantity_total, quantity_available, reorder_level, unit_cost, location, notes } = req.body;
    await pool.query(
      `UPDATE inventory_items SET name=?,category=?,unit=?,quantity_total=?,quantity_available=?,reorder_level=?,unit_cost=?,location=?,notes=? WHERE id=?`,
      [name, category, unit, quantity_total, quantity_available, reorder_level, unit_cost, location, notes, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM inventory_items WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Item deleted' });
  } catch(err) { next(err); }
};

exports.getLowStockItems = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory_items WHERE quantity_available <= reorder_level ORDER BY (quantity_available - reorder_level) ASC');
    res.json({ success: true, data: rows, count: rows.length });
  } catch(err) { next(err); }
};

exports.allocateToProject = async (req, res, next) => {
  try {
    const { project_id, item_id, quantity, notes } = req.body;
    const [item] = await pool.query('SELECT quantity_available FROM inventory_items WHERE id=?', [item_id]);
    if (!item.length) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item[0].quantity_available < quantity) return res.status(400).json({ success: false, message: `Not enough stock. Available: ${item[0].quantity_available}` });
    const [result] = await pool.query(
      `INSERT INTO project_materials (project_id,item_id,quantity,notes) VALUES (?,?,?,?)`,
      [project_id, item_id, quantity, notes]
    );
    await pool.query('UPDATE inventory_items SET quantity_available=quantity_available-? WHERE id=?', [quantity, item_id]);
    const [rows] = await pool.query('SELECT * FROM project_materials WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch(err) { next(err); }
};

exports.returnFromProject = async (req, res, next) => {
  try {
    const [alloc] = await pool.query('SELECT * FROM project_materials WHERE id=?', [req.params.allocation_id]);
    if (!alloc.length) return res.status(404).json({ success: false, message: 'Allocation not found' });
    if (alloc[0].returned_at) return res.status(400).json({ success: false, message: 'Already returned' });
    await pool.query('UPDATE project_materials SET returned_at=NOW() WHERE id=?', [req.params.allocation_id]);
    await pool.query('UPDATE inventory_items SET quantity_available=quantity_available+? WHERE id=?', [alloc[0].quantity, alloc[0].item_id]);
    res.json({ success: true, message: 'Items returned to warehouse' });
  } catch(err) { next(err); }
};

exports.getProjectMaterials = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT pm.*, i.name AS item_name, i.unit, i.unit_cost, (pm.quantity * i.unit_cost) AS total_cost
      FROM project_materials pm JOIN inventory_items i ON pm.item_id=i.id
      WHERE pm.project_id=? ORDER BY pm.allocated_at DESC
    `, [req.params.project_id]);
    res.json({ success: true, data: rows });
  } catch(err) { next(err); }
};