import jscodeshift from 'jscodeshift';
import { join } from 'path';
import { sync as globSync } from 'glob';
import { readFileSync } from 'fs';
import transform from '../transform';

export function loadAll({ sourcePath }) {
  const files = globSync('**/*.js?(x)', {
    cwd: sourcePath,
    dot: false,
    ignore: ['node_modules/**']
  });

  return files.reduce((memo, path) => {
    const source = readFileSync(join(sourcePath, path), 'utf-8');
    const info = transform({ path, source }, { jscodeshift });
    memo[path] = info;
    return memo;
  }, {});
}

export function loadOne({ sourcePath, filepath }) {
  // 不需要做任何事
}
