const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const parse = require('./src/index').default;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  parse({
    // sourcePath: './dva-projects/user-dashboard'
    sourcePath: './demo'
  }).then(
    data => {
      res.end(JSON.stringify(data))
    }
  );
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
