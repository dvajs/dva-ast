import api from '../../src/api/index';
import expect from 'expect';
import { removeSync, outputFileSync, readFileSync } from 'fs-extra';
import { join, dirname } from 'path';

describe('api/entry', () => {

  const filePath = './tmp/a.js';
  const absFilePath = join(__dirname, filePath);

  afterEach(() => {
     removeSync(dirname(absFilePath));
  });

  it('entry.addModel', () => {
    const source = `
      import dva from 'dva';
      const app = dva();
      app.model(require('./model/app'));
      app.router(() => <App />);
      app.start('#root');
    `;
    outputFileSync(absFilePath, source, 'utf-8');
    api('entry.addModel', {
      filePath: filePath,
      sourcePath: __dirname,
      modelPath: './model/count',
    });
    expect(readFileSync(absFilePath, 'utf-8')).toEqual(`
      import dva from 'dva';
      const app = dva();
      app.model(require('./model/app'));
      app.model(require("./model/count"));
      app.router(() => <App />);
      app.start('#root');
    `);
  });
});
