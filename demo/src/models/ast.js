import { call, put } from 'dva/effects';
import * as astService from '../services/ast';

export default {
  namespace: 'ast',
  state: {
    components: [],
    models: [],
  },
  effects: {
    *['ast/query']({ payload }) {
      try {
        const result = yield call(astService.query);
        yield put({
          type: 'ast/query/success',
          payload: result.data,
        });
      } catch (e) {
        yield put({
          type: 'ast/query/failure',
          err: e,
        });
      }
    },
    *['ast/saveReducer']({ payload }) {
      try {
        const result = yield call(astService.saveReducer, payload);
      } catch (e) {
        console.error(e);
      }
    },
  },
  reducers: {
    ['ast/query'](state) {
      return { ...state, loading: true };
    },
    ['ast/query/success'](state, action) {
      return { ...state, loading: false, ...action.payload };
    },
    ['ast/query/failure'](state, action) {
      return { ...state, loading: false, ...action.payload };
    },

    ['ast/saveReducer'](state, action) {
      // only for testing
      state.models[0].data.reducers[action.payload.action] = action.payload;
      state.models = state.models.concat([]);
      return { ...state };
    },
  },

}
