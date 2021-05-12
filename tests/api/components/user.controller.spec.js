const supertest = require('supertest');
const container = require('../../../api/startup/container');

const { app } = container.resolve('App');
const api = supertest(app);
