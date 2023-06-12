const express = require('express');

const { ApiError, errorHandler } = require('../helpers/errorHandler');

const projectRouter = require('./projectRouter');
const userRouter = require('./userRouter');
const tagRouter = require('./tagRouter');
const router = express.Router();

router.use('/api/projects', projectRouter);
router.use('/api/users', userRouter);
router.use('/api/tags', tagRouter);

router.use(() => {
  throw new ApiError('API Route not found', { statusCode: 404 });
});

router.use((err, _, res, next) => {
  errorHandler(err, res, next);
});

module.exports = router;
