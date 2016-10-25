import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { existsSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import j from 'jscodeshift';
import { addModel } from './entry';
import Model from '../collections/Model';

Model.register();

export function create(payload) {
  assert(payload.namespace, 'api/models/create: payload should have namespace');
  const template = getTemplate('models.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  assert(!existsSync(filePath), 'api/models/create: file exists');
  writeFile(filePath, source);

  // Add model to entry
  if (payload.entry && payload.modelPath) {
    addModel({
      sourcePath: payload.sourcePath,
      filePath: payload.entry,
      modelPath: payload.modelPath,
    });
  }
}

export function remove(payload) {
  const filePath = join(payload.sourcePath, payload.filePath);
  removeFile(filePath);
}

export function updateNamespace(payload) {
  _action('updateNamespace', payload, ['newNamespace']);
}

export function updateState(payload) {
  _action('updateState', payload, ['source']);
}

export function addReducer(payload) {
  _action('addReducer', payload, ['name', 'source'], ['source']);
}

export function addEffect(payload) {
  _action('addEffect', payload, ['name', 'source'], ['source']);
}

export function addSubscription(payload) {
  _action('addSubscription', payload, ['name', 'source'], ['source']);
}

export function updateReducer(payload) {
  _action('updateReducer', payload, ['name', 'source']);
}

export function updateEffect(payload) {
  _action('updateEffect', payload, ['name', 'source']);
}

export function updateSubscription(payload) {
  _action('updateSubscription', payload, ['name', 'source']);
}

export function removeReducer(payload) {
  _action('removeReducer', payload, ['name']);
}

export function removeEffect(payload) {
  _action('removeEffect', payload, ['name']);
}

export function removeSubscription(payload) {
  _action('removeSubscription', payload, ['name']);
}


/**
 * private
 */
function _action(type, payload, checklist, optional = []) {
  for (let checkitem of ['namespace', ...checklist]) {
    if (optional.indexOf(checkitem) === -1) {
      assert(payload[checkitem], `api/models/${type}: payload should have ${checkitem}`);
    }
  }

  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const models = root.findModels(payload.namespace);
  const args = checklist.map(checkitem => payload[checkitem]);
  models[type].apply(models, args);
  writeFile(filePath, root.toSource());
}


