const http = require('http');
require('dotenv').config();
const app = require('./app');

const port = process.env.PORT ?? 4000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});
