const express = require('express');
const { httpGetAllPlanets } = require('./plannets.controller');

const planetsRouter = express.Router();

planetsRouter.get('/' , httpGetAllPlanets);

module.exports = planetsRouter;