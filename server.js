import express from 'express';
import bodyParser from 'body-parser';
import parse, { saveReducer } from './src';

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

app.use(bodyParser.json());
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


app.post('/api/ast/saveReducer', (req, res) => {
  try {
    saveReducer(req.body, () => {
      res.json(req.body)
    });
  } catch (e) {
    console.error(e);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
