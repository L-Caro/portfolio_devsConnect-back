const express = require('express');
const projectController = require('../controllers/projectController');
const router = express.Router();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getOneProject);

router.post('/', projectController.addOneProject);

router.delete('/:id', projectController.deleteOneProject);

router.put('/:id', projectController.editOneProject);

module.exports = router;
