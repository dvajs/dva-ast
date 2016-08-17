import express from 'express';
import parse from './src';

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

app.get('/api/ast/query', (req, res) => {
  parse({
    // sourcePath: './dva-projects/user-dashboard'
    sourcePath: './demo'
  }).then(
    data => {
      res.json(data);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
