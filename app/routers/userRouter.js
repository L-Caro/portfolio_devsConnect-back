const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getAllUsers); 
router.get('/:id', userController.getOneUser); 

router.post('/', userController.addOneUser);

router.delete('/:id', userController.deleteOneUser); 

router.put('/:id', userController.editOneUser);

module.exports = router;
