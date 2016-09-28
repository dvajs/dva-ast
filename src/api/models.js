import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { join } from 'path';
import assert from 'assert';
import j from 'jscodeshift';

export function create(payload) {
  assert(payload.namespace, 'api/models/create: payload should have namespace');
  const template = getTemplate('models.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  writeFile(filePath, source);
}

export function remove(payload) {
  const filePath = join(payload.sourcePath, payload.filePath);
  removeFile(filePath);
}

export function updateNamespace(payload) {
  assert(
    payload.namespace && payload.newNamespace,
    'api/models/updateNamespace: payload should have namespace and newNamespace'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  root.findModels(payload.namespace).updateNamespace(payload.newNamespace);
  const newSource = root.toSource();
  writeFile(filePath, newSource);
}

export function updateState(payload) {}

export function addReducer(payload) {}

export function updateReducer(payload) {}

export function removeReducer(payload) {}

export function addEffect(payload) {}

export function updateEffect(payload) {}

export function removeEffect(payload) {}

export function addSubscription(payload) {}

export function updateSubscription(payload) {}

export function removeSubscription(payload) {}

