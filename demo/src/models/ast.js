import { call, put, select } from 'dva/effects';
import * as astService from '../services/ast';

export default {
  namespace: 'ast',
  state: {
    components: [],
    models: [],
    dispatches: [],
    reducers: [],
    effects: [],
  },
  subscriptions: [
    ({ dispatch }) => {
      dispatch({
        type: 'aaaa',
      });
    },
  ],
  effects: {
    *['ast/query']({ payload }) {
      try {
        const result = yield call(astService.query);
        yield put({ type: 'ast/query/success', payload: result.data });
      } catch (e) {
        yield put({ type: 'ast/query/failure', err: e });
      }
    },
    *['ast/component/create']({ payload }) {
    },
    *['ast/component/remove']({ payload }) {
    },
    *['ast/component/update']({ payload }) {
    },
    *['ast/saveReducer']({ payload }) {
    },
    *['ast/removeReducer']({ payload }) {
    },
    *['ast/addReducer']({ payload }) {
    }
  },
  reducers: {
    ['ast/query'](state) {
      return { ...state, loading: true };
    },
    ['ast/query/success'](state, action) {
      return {
        ...state,
        loading: false,
        ...action.payload,
      };
    },
    ['ast/query/failure'](state, action) {
      return { ...state, loading: false, ...action.payload };
    },
  },

}
