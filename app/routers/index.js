const { Router } = require('express');

const projectRouter = require('./projectRouter');
const userRouter = require('./userRouter');
const tagRouter = require('./tagRouter');
const router = Router();

router.use('/api/projects', projectRouter);
router.use('/api/users', userRouter);
router.use('/api/tags', tagRouter);

module.exports = router;
