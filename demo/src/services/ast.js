import request from '../utils/request';

export async function query() {
  return request('/api/ast/query');
}

export async function saveReducer(payload) {
  return request('/api/ast/saveReducer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
