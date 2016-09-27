import jscodeshift from 'jscodeshift';
import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import transform from '../transform';

import * as models from './models';
import * as routeComponents from './routeComponents';
import * as router from './router';

const TYPE_SEP = '.';
const apiMap = {
  models,
  routeComponents,
  router,
};

export default function(type, payload) {
  // sourcePath 由 server 端额外提供
  assert(type, `api: type should be defined`);
  assert(payload.filePath, `api: payload should have filePath`);
  assert(payload.sourcePath, `api: payload should have sourcePath`);
  const [cat, method] = type.split(TYPE_SEP);

  assert(cat && method, `api: type should be cat.method, e.g. models.create`);
  assert(apiMap[cat], `api: cat ${cat} not found`);
  assert(apiMap[cat][method], `api: method ${method} of cat ${cat} not found`);

  // 更新物理文件
  const fn = apiMap[cat][method];
  fn(payload);

  // 返回新的 transform 结果
  const { filePath, sourcePath } = payload;
  const file = {
    source: readFileSync(join(sourcePath, filePath), 'utf-8'),
    path: filePath,
  };
  return transform(file, { jscodeshift });
}
