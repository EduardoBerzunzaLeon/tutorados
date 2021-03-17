const { createContainer, asValue, asClass, asFunction } = require('awilix');

const App = require('./app');
const Server = require('./server');
const Startup = require('./Startup');
const config = require('../config/environments');
const router = require('./router');

// Teachers application
const { TeacherController, teacherRoutes } = require('./components/teachers');

const container = createContainer();

container.register({
    App: asClass(App).singleton(),
    Server: asClass(Server).singleton(),
    Startup: asClass(Startup).singleton(),
    config: asValue(config),
    router: asFunction(router).singleton()
}).register({
    TeacherController: asClass(TeacherController).singleton(),
    teacherRoutes: asFunction(teacherRoutes).singleton()
})

module.exports = container;