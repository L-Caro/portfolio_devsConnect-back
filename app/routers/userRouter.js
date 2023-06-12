const express = require('express');
const userController = require('../controllers/userController');
const controllerHandler = require('../helpers/controllerHandler');

const router = express.Router();

router.get('/:id', controllerHandler(userController.getOneUser)); 
router.get('/', controllerHandler(userController.getAllUsers)); 

router.post('/', controllerHandler(userController.addOneUser));

router.put('/:id', controllerHandler(userController.editOneUser));

router.delete('/:id', controllerHandler(userController.deleteOneUser)); 

module.exports = router;
