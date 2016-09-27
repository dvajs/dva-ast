import api from '../src/api/index';
import expect from 'expect';

describe('api', () => {

  it('normal', () => {
    const result = api('models.create', {
      filePath: './tmp/a.js',
      sourcePath: __dirname,
      namespace: 'a',
    });
    expect(result).toEqual(
      {"models":{"data":[{"reducers":[],"effects":[],"subscriptions":[],"namespace":"a","state":{},"id":"Model^^./tmp/a.js^^a","filePath":"./tmp/a.js"}],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":null,"routeComponents":[],"dispatches":{}}
    );
  });
});
