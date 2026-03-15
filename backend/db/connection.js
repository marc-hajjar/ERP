const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME     || 'achi_erp',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected to:', process.env.DB_NAME || 'achi_erp');
    conn.release();
  })
  .catch(err => console.error('❌ DB connection error:', err.message));

module.exports = { pool };