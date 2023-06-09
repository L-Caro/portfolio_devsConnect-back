const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tagController');

router.get('/api/tags', tagController.getAllTags);
router.get('/api/tags/:id', tagController.getOneTag); 

module.exports = router;
