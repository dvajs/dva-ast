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
      { dispatches: { 'app/showLoading': { input: [], output: [ 'Reducer^^models/app.js^^showLoading' ] } }, models: { data: [ { effects: [], filePath: 'models/app.js', id: 'Model^^models/app.js^^app', namespace: 'app', reducers: [ 'Reducer^^models/app.js^^showLoading' ], state: { loading: false }, subscriptions: [] } ], effectByIds: {}, reducerByIds: { 'Reducer^^models/app.js^^showLoading': { filePath: 'models/app.js', id: 'Reducer^^models/app.js^^showLoading', modelId: 'Model^^models/app.js^^app', name: 'showLoading', source: 'function(state) {\n  return { ...state, loading: true, };\n}' } }, subscriptionByIds: {} }, routeComponents: [], router: null }
    );
  });

});
