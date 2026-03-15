const router = require('express').Router();
const ctrl   = require('../controllers/crmController');

router.get('/clients',              ctrl.getClients);
router.get('/clients/:id',          ctrl.getClientById);
router.post('/clients',             ctrl.createClient);
router.put('/clients/:id',          ctrl.updateClient);
router.delete('/clients/:id',       ctrl.deleteClient);
router.get('/leads',                ctrl.getLeads);
router.post('/leads',               ctrl.createLead);
router.put('/leads/:id',            ctrl.updateLead);
router.post('/leads/:id/convert',   ctrl.convertLead);
router.get('/quotations',           ctrl.getQuotations);
router.post('/quotations',          ctrl.createQuotation);
router.patch('/quotations/:id',     ctrl.updateQuotationStatus);
router.get('/communications',       ctrl.getCommunications);
router.post('/communications',      ctrl.addCommunication);

module.exports = router;