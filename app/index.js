const express = require('express');
const router = require('./routers');

const app = express();

// mise en place des methodes json et URL encoded dans l'app de l'api
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//lancement du router
app.use(router);

module.exports = app;
