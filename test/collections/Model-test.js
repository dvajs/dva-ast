import expect from 'expect';
import j from 'jscodeshift';
import Model from '../../src/collections/Model';

// Register methods.
Model.register();

describe('collections/Model', () => {

  describe('findModelProperties', () => {
    it('namespace and state', () => {
      expect(j(`({namespace:'count',state:0})`).findModels().size()).toEqual(1);
    });
    it('namespace only', () => {
      expect(j(`({namespace:'count'})`).findModels().size()).toEqual(0);
    });
    it('namespace and reducers', () => {
      expect(j(`({namespace:'count',reducers:{}})`).findModels().size()).toEqual(1);
    });
  });

  describe('getModelInfo', () => {
    it('normal', () => {
      const code = `
        export default {
          namespace: 'count',
          state: 0,
          reducers: {
            add() {},
            minus() {},
          },
          effects: {
            *addMinus() {
              yield put({ type: 'a' });
            },
          },
          subscriptions: {
            setup() {
              dispatch({ type: 'addMinus' });
            },
          },
        };
      `;
      const model = j(code).find(j.ObjectExpression).at(0).getModelInfo();
      expect(model).toEqual(
        [{"namespace":"count","state":0,"reducers":[{"name":"add","source":"function() {}"},{"name":"minus","source":"function() {}"}],"effects":[{"name":"addMinus","source":"function*() {\n  yield put({ type: 'a' });\n}","dispatches":["a"]}],"subscriptions":[{"name":"setup","source":"function() {\n  dispatch({ type: 'addMinus' });\n}","dispatches":["addMinus"]}]}]
      );
    });
  });

  describe('addReducer', () => {
    it('has reducers', () => {
      const root = j(`({reducers:{}})`);
      root.find(j.ObjectExpression).at(0).addReducer('add');
      expect(root.toSource()).toEqual(`({reducers:{
  add: function(state) {
    return state;
  }
}})`);
    });
    it('no reducers', () => {
      const root = j(`({})`);
      root.find(j.ObjectExpression).at(0).addReducer('add');
      expect(root.toSource()).toEqual(`(({
  reducers: {
    add: function(state) {
      return state;
    }
  }
}))`);
    });
    it('add with source', () => {
      const root = j(`({})`);
      root.find(j.ObjectExpression).at(0).addReducer('add', 'function(state) { return state + 1; }');
      expect(root.toSource()).toEqual(`(({
  reducers: {
    add: function(state) { return state + 1; }
  }
}))`);
    });
  });

});
