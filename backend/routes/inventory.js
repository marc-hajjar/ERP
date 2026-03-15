const router = require('express').Router();
const ctrl   = require('../controllers/inventoryController');

router.get('/items',                          ctrl.getItems);
router.get('/items/low-stock',                ctrl.getLowStockItems);
router.get('/items/:id',                      ctrl.getItemById);
router.post('/items',                         ctrl.createItem);
router.put('/items/:id',                      ctrl.updateItem);
router.delete('/items/:id',                   ctrl.deleteItem);
router.post('/allocate',                      ctrl.allocateToProject);
router.post('/return/:allocation_id',         ctrl.returnFromProject);
router.get('/project/:project_id/materials',  ctrl.getProjectMaterials);

module.exports = router;