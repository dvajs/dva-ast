import * as utils from './utils';
import { join } from 'path';
import assert from 'assert';

export function create(payload) {
  assert(payload.namespace, 'api/models/create: payload should have namespace');
  const template = utils.getTemplate('models.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  utils.writeFile(filePath, source);
}

export function updateNamespace(payload) {}

export function updateState(payload) {}

export function addReducer(payload) {}

export function updateReducer(payload) {}

export function deleteReducer(payload) {}

export function addEffect(payload) {}

export function updateEffect(payload) {}

export function deleteEffect(payload) {}

export function addSubscription(payload) {}

export function updateSubscription(payload) {}

export function deleteSubscription(payload) {}

