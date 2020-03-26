const express = require('express');
const router = express.Router();

const menusRouter = require('./menus.js');
const employeesRouter = require('./employees.js');

apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;