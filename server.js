const http = require('http');
const getUserDashboardDvaSegments = require('./demo/userDashboard').default;

const hostname = '127.0.0.1';
const port = 3000;


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  getUserDashboardDvaSegments().then((data) => {
    res.end(JSON.stringify(data));
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
