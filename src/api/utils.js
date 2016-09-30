import Handlebars from 'handlebars';
import assert from 'assert';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { outputFileSync, removeSync } from 'fs-extra';

export function getTemplate(name) {
  const filePath = join(__dirname, `../../boilerplates/${name}.handlebars`);
  assert(existsSync(filePath), `getTemplate: file ${name} not fould`);
  const source = readFileSync(filePath, 'utf-8');
  return Handlebars.compile(source);
}

export function readFile(filePath) {
  return readFileSync(filePath, 'utf-8');
}

export function writeFile(filePath, source) {
  outputFileSync(filePath, source, 'utf-8');
}

export function removeFile(filePath) {
  removeSync(filePath);
}
