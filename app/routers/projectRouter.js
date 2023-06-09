const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');

router.get('/api/projects', projectController.getAllProjects);
router.get('/api/projects/:id', projectController.getOneProject);

router.post('/api/projects', projectController.addOneProject);

router.delete('/api/projects/:id', projectController.deleteOneProject);

router.put('/api/projects/:id', projectController.editOneProject);

module.exports = router;
