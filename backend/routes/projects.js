const router = require('express').Router();
const ctrl   = require('../controllers/projectsController');

router.get('/workers/list',                   ctrl.getWorkers);
router.post('/workers',                       ctrl.createWorker);
router.put('/workers/:id',                    ctrl.updateWorker);
router.get('/',                               ctrl.getProjects);
router.get('/:id',                            ctrl.getProjectById);
router.post('/',                              ctrl.createProject);
router.put('/:id',                            ctrl.updateProject);
router.delete('/:id',                         ctrl.deleteProject);
router.get('/:id/cost-summary',               ctrl.getProjectCostSummary);
router.post('/:project_id/workers',           ctrl.assignWorker);
router.delete('/assignments/:assignment_id',  ctrl.removeWorker);

module.exports = router;