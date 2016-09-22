import expect from 'expect';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import j from 'dva-jscodeshift/dist/core';

import componentParserFactory from '../src/parsers/component';
import modelParserFactory from '../src/parsers/model';
import routeParserFactory from '../src/parsers/route';
import getInfrastructureUtils from '../src/utils/InfrastructureUtils';
import getReactUtils from '../src/utils/ReactUtils';

const fixtures = join(__dirname, 'fixtures');
const infrastructureUtils = getInfrastructureUtils(j);
const componentParser = componentParserFactory(j);
const modeltParser = modelParserFactory(j);
const routeParser = routeParserFactory(j);

function buildTests(type, { getResult }) {
  const dir = join(fixtures, type);
  const list = readdirSync(dir);

  describe(type, () => {
    for (const item of list) {
      const isOnly = /-only$/.test(item);
      const testFn = isOnly ? it.only.bind(it) : it;

      testFn(`should work with ${type} ${item}`, () => {
        const filePath = join(dir, item, 'actual.js');
        const source = readFileSync(filePath, 'utf-8');
        const root = j(source);

        const actual = getResult({ filePath, source, root, j });

        const jsonResult = JSON.stringify(actual, null, 2);
        const expectedFilePath = join(dir, item, 'expected.json');
        const expected = readFileSync(expectedFilePath, 'utf-8');

        // For adding new testcase.
        if (isOnly) console.log(jsonResult);

        expect(jsonResult).toEqual(expected);
      });
    }
  });
}

function normalize(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalize);
  }
  if (obj.id) obj.id = obj.id.replace(fixtures, '.').replace(/-only/, '');
  if (obj.filePath) obj.filePath = obj.filePath.replace(fixtures, '.').replace(/-only/, '');
  return Object.keys(obj).reduce((memo, key) => {
    if (key !== 'node') memo[key] = obj[key];
    return memo;
  }, {});
}

describe('dva-ast', () => {
  // components
  buildTests('components', {
    getResult({ root, filePath }) {
      const results = [];
      infrastructureUtils.findComponents(root, nodePath => {
        const result = componentParser.parse({
          nodePath,
          filePath,
          root,
        });
        results.push(normalize(result));
      });
      return results;
    },
  });

  // models
  buildTests('models', {
    getResult({ root, filePath, jscodeshift }) {
      const results = [];
      infrastructureUtils.findModels(root, nodePath => {
        const result = modeltParser.parse({
          nodePath,
          filePath,
          jscodeshift,
        });
        results.push({
          ...result,
          subscriptions: normalize(result.subscriptions),
          reducers: normalize(result.reducers),
          effects: normalize(result.effects),
          model: normalize(result.model),
        });
      });
      return results;
    },
  });

  // router
  buildTests('router', {
    getResult({ root, filePath }) {
      const results = [];
      infrastructureUtils.findRoutes(root, nodePath => {
        const result = routeParser.parse({
          nodePath,
          filePath,
        });
        results.push(normalize(result));
      });
      return results;
    },
  });
});
