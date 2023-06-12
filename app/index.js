const express = require('express');
const router = require('./routers');

const app = express();

// SWAGGER
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "DevsConnect library API",
			version: "1.0.0",
			description: "Documentation for DevsConnect API",
		},
		servers: [
			{
				url: "http://localhost:3000",
			},
		],
	},
	apis: ["./app/routers/*.js"],
};

const specs = swaggerJsDoc(options);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// mise en place des methodes json et URL encoded dans l'app de l'api
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//lancement du router
app.use(router);

module.exports = app;
