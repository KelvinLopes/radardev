const { Router } = require('express');
const DevController = require('./controllers/DevController');
const DevCoordinatesController = require('./controllers/DevCoordinatesController');
const SearchController = require('./controllers/SearchController');

const routes = Router();

routes.get('/devs', DevController.index);

routes.post('/devs', DevController.store);
routes.put('/devs/:_id', DevController.update);
routes.put('/devs/coordinates/:_id', DevCoordinatesController.update);

routes.delete('/devs/:_id', DevController.delete);

routes.get('/search', SearchController.index);

module.exports = routes;
