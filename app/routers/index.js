const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const tagController = require('../controllers/tagController');


router.get('/api/projects', projectController.getAllProjects); 
router.get('/api/project/:id', projectController.getOneProject); 

router.get('/api/tags', tagController.getAllTags); 
router.get('/api/tag/:id', tagController.getOneTag); 

module.exports = router;
