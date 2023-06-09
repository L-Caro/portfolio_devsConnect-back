const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const userController = require('../controllers/userController');
const tagController = require('../controllers/tagController');

// routes generales listees dans un seul routeur avant refactorisation (progression empirique)
router.get('/api/projects', projectController.getAllProjects); 
router.get('/api/project/:id', projectController.getOneProject); 
router.post('/api/projects', projectController.addOneProject)
router.delete('/api/project/:id', projectController.deleteOneProject); 

router.get('/api/tags', tagController.getAllTags); 
router.get('/api/tag/:id', tagController.getOneTag); 

router.get('/api/users', userController.getAllUsers); 
router.get('/api/user/:id', userController.getOneUser); 
router.post('/api/users', userController.addOneUser)
router.delete('/api/user/:id', userController.deleteOneUser); 

module.exports = router;
