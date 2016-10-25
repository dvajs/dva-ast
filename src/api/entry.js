import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { join } from 'path';
import assert from 'assert';
import j from 'jscodeshift';
import Entry from '../collections/Entry';

Entry.register();

export function addModel(payload) {
  assert(payload.modelPath, 'api/entry/addModel: payload should have modelPath');
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  root.addModel(payload.modelPath);
  writeFile(filePath, root.toSource());
}
