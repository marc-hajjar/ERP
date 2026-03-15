const router = require('express').Router();
const ctrl   = require('../controllers/accountingController');

router.get('/invoices',            ctrl.getInvoices);
router.get('/invoices/:id',        ctrl.getInvoiceById);
router.post('/invoices',           ctrl.createInvoice);
router.patch('/invoices/:id',      ctrl.updateInvoiceStatus);
router.get('/expenses',            ctrl.getExpenses);
router.post('/expenses',           ctrl.createExpense);
router.delete('/expenses/:id',     ctrl.deleteExpense);
router.get('/payments',            ctrl.getPayments);
router.post('/payments',           ctrl.recordPayment);
router.get('/suppliers',           ctrl.getSuppliers);
router.post('/suppliers',          ctrl.createSupplier);
router.put('/suppliers/:id',       ctrl.updateSupplier);
router.delete('/suppliers/:id',    ctrl.deleteSupplier);
router.get('/reports/profit-loss', ctrl.getProfitLoss);

module.exports = router;