import expect from 'expect';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';
import j from 'dva-jscodeshift/dist/core';

import componentParserFactory from '../src/parsers/component';
import getInfrastructureUtils from '../src/utils/InfrastructureUtils';
import getReactUtils from '../src/utils/ReactUtils';

const fixtures = join(__dirname, 'fixtures');

describe('dva-ast', () => {

  const dir = join(fixtures, 'components');
  const components = readdirSync(dir);
  const infrastructureUtils = getInfrastructureUtils(j);
  const componentParser = componentParserFactory(j);

  for (const component of components) {
    const isOnly = /-only$/.test(component);
    const testFn = isOnly ? it.only.bind(it) : it;

    testFn(`should work with component ${component}`, () => {
      const filePath = join(dir, component, 'actual.js');
      const source = readFileSync(filePath, 'utf-8');
      const root = j(source);

      const actual = [];
      infrastructureUtils.findComponents(root, nodePath => {
        const result = componentParser.parse({
          nodePath,
          filePath,
          root,
        });
        actual.push(normalize(result));
      });

      const jsonResult = JSON.stringify(actual, null, 2);
      const expectedFilePath = join(dir, component, 'expected.json');
      const expected = readFileSync(expectedFilePath, 'utf-8');

      // For adding new testcase.
      if (isOnly) console.log(jsonResult);

      expect(jsonResult).toEqual(expected);
    });
  }
});

function normalize(obj) {
  obj.id = obj.id.replace(fixtures, '.').replace(/-only/, '');
  obj.filePath = obj.filePath.replace(fixtures, '.').replace(/-only/, '');
  return Object.keys(obj).reduce((memo, key) => {
    if (key !== 'node') memo[key] = obj[key];
    return memo;
  }, {});
}
