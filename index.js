const http = require('http');
require('dotenv').config();
const debug = require('debug')('app:server');
const app = require('./app');
const cors = require('cors');

const port = process.env.PORT ?? 4000;

app.use(cors());

const server = http.createServer(app);

server.listen(port, () => {
  debug(`API started on port ${port}`);
  debug(`API Docs here : http://localhost:${port}/api-docs/`);
  console.log(`API Docs here : http://localhost:${port}/api-docs/`);
});
