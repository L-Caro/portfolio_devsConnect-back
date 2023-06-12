const express = require('express');
const tagController = require('../controllers/tagController');
const controllerHandler = require('../helpers/controllerHandler');
const router = express.Router();

router.get('/', controllerHandler(tagController.getAllTags));
router.get('/:id', controllerHandler(tagController.getOneTag)); 

module.exports = router;
