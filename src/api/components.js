import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import assert from 'assert';
import { extname, join } from 'path';
import { existsSync } from 'fs';

export function create(payload) {
  assert(payload.componentName, 'api/components/create: payload should have componentName');
  const template = getTemplate('components.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  assert(!existsSync(filePath), 'api/components/create: file exists');
  writeFile(filePath, source);

  if (payload.css) {
    let cssFilePath = filePath;
    const en = extname(filePath);
    if (en) {
      cssFilePath = filePath.slice(0, filePath.lastIndexOf(en));
    }
    cssFilePath = cssFilePath + '.css';
    writeFile(cssFilePath, `\r\n.normal {\r\n}\r\n`);
  }
}
