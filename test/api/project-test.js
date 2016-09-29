import api from '../../src/api/index';
import expect from 'expect';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('api/project', () => {

  it('loadAll', () => {
    const sourcePath = join(__dirname, '../fixtures/projects/count/actual');
    const result = api('project.loadAll', {
      sourcePath,
    });
    const expected = readFileSync(join(sourcePath, '../expected.json'), 'utf-8');
    expect(JSON.stringify(result, null, 2)).toEqual(expected);
  });

  it('loadOne', () => {
    const sourcePath = join(__dirname, '../fixtures/projects/count/actual');
    const result = api('project.loadOne', {
      sourcePath,
      filePath: 'models/app.js'
    });
    expect(result).toEqual(
      {"models":{"data":[{"reducers":["Reducer^^models/app.js^^showLoading"],"effects":[],"subscriptions":[],"namespace":"app","state":{"loading":false},"id":"Model^^models/app.js^^app","filePath":"models/app.js"}],"reducerByIds":{"Reducer^^models/app.js^^showLoading":{"name":"showLoading","source":"function(state) {\n  return { ...state, loading: true, };\n}","id":"Reducer^^models/app.js^^showLoading","filePath":"models/app.js"}},"effectByIds":{},"subscriptionByIds":{}},"router":null,"routeComponents":[],"dispatches":{"app/showLoading":{"input":[],"output":["Reducer^^models/app.js^^showLoading"]}}}
    );
  });

});
