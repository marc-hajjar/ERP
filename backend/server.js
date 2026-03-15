const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/accounting', require('./routes/accounting'));
app.use('/api/crm',        require('./routes/crm'));
app.use('/api/inventory',  require('./routes/inventory'));
app.use('/api/projects',   require('./routes/projects'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'ACHI Scaffolding ERP', timestamp: new Date() });
});

app.get('/api/dashboard', require('./controllers/dashboardController'));
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ACHI ERP backend running on http://localhost:${PORT}`);
});