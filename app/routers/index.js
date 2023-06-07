const express = require('express');
const router = express.Router();


router.get('/api/projects', projectController.getAllProjects()); 

module.exports = router;
