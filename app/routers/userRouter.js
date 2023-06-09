const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/api/users', userController.getAllUsers); 
router.get('/api/users/:id', userController.getOneUser); 

router.post('/api/users', userController.addOneUser);

router.delete('/api/users/:id', userController.deleteOneUser); 

router.put('/api/users/:id', userController.editOneUser);

module.exports = router;
