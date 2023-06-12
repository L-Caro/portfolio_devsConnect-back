const express = require('express');
const projectController = require('../controllers/projectController');
const controllerHandler = require('../helpers/controllerHandler');
const router = express.Router();

router.get('/:id', controllerHandler(projectController.getOneProject));
router.get('/', controllerHandler(projectController.getAllProjects));

router.post('/', controllerHandler(projectController.addOneProject));

router.put('/:id', controllerHandler(projectController.editOneProject));

router.delete('/:id', controllerHandler(projectController.deleteOneProject));

module.exports = router;
