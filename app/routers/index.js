const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const userController = require('../controllers/userController');

router.get('/api/projects', projectController.getAllProjects); 
router.get('/api/project/:id', projectController.getOneProject); 

router.get('/api/users', userController.getAllUsers); 
router.get('/api/user/:id', userController.getOneUser); 

module.exports = router;
