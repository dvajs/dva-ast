import expect from 'expect';
import j from 'dva-jscodeshift';
import RouteComponent, { UNRESOLVED_IDENTIFIER } from '../../src/collections/RouteComponent';

// Register methods.
RouteComponent.register();

describe('collections/RouteComponent', () => {

  describe('getFirstComponentName', () => {
    it('FunctionDeclaration', () => {
      expect(j(`function A() {}`).find(j.FunctionDeclaration).getFirstComponentName()).toEqual('A');
    });
    it('FunctionExpression', () => {
      expect(j(`Form.create(function A() {})`).find(j.FunctionExpression).getFirstComponentName()).toEqual('A');
    });
    it('VariableDeclarator 1', () => {
      expect(j(`const A = function() {}`).find(j.VariableDeclarator).getFirstComponentName()).toEqual('A');
    });
    it('VariableDeclarator 2', () => {
      expect(j(`const A = () => {}`).find(j.VariableDeclarator).getFirstComponentName()).toEqual('A');
    });
    it('ClassDeclaration', () => {
      expect(j(`class A {}`).find(j.ClassDeclaration).getFirstComponentName()).toEqual('A');
    });
    it('throw error for anonymous component', () => {
      expect(_ => {
        j(`Form.create(function() {})`).find(j.FunctionExpression).getFirstComponentName();
      }).toThrow(/getFirstComponentName: component should not be anonymous/);
    });
    it('throw error for unsupported types', () => {
      expect(_ => {
        j(`const a;`).getFirstComponentName();
      }).toThrow(/getFirstComponentName: unsupported node.type/);
    });
  });

  describe('findDispatchCalls', () => {
    it('dispatch', () => {
      expect(j(`dispatch()`).findDispatchCalls().size()).toEqual(1);
      expect(j(`props.dispatch()`).findDispatchCalls().size()).toEqual(1);
    });
    it('put', () => {
      expect(j(`yield put()`).findDispatchCalls().size()).toEqual(1);
    });
  });

  describe('getActionTypeFromCall', () => {
    it('dispatch', () => {
      expect(j(`dispatch({type:'a'})`).find(j.CallExpression).getActionTypeFromCall()).toEqual(['a']);
    });
    it('put', () => {
      expect(j(`yield put({type:'a'})`).find(j.CallExpression).getActionTypeFromCall()).toEqual(['a']);
    });
    it('multiple dispatch', () => {
      expect(j(`dispatch({type:'a'});put({type:'b'})`).find(j.CallExpression).getActionTypeFromCall()).toEqual(['a', 'b']);
    });
    it('resolve scope identifier (inside)', () => {
      expect(j(`function A() { const a = 'a'; dispatch({type:a}) }`).find(j.CallExpression).getActionTypeFromCall()).toEqual(['a']);
    });
    it('resolve scope identifier (outside)', () => {
      expect(j(`const a = 'a'; function A() { dispatch({type:a}) }`).find(j.CallExpression).getActionTypeFromCall()).toEqual(['a']);
    });
    it('throw error if identifier is unresolved', () => {
      expect(j(`function A() { dispatch({type:a}) }`).find(j.CallExpression).getActionTypeFromCall()).toEqual([UNRESOLVED_IDENTIFIER]);
    });
  });

  describe('findMapFunction', () => {
    it('FunctionExpression', () => {
      const fns = j(`connect(function(state) { return { c: state.count }; })(App)`)
        .find(j.CallExpression).at(1)
        .findMapFunction();
      expect(j(fns.get()).toSource()).toEqual('function(state) { return { c: state.count }; }');
    });
    it('ArrowFunctionExpression', () => {
      const fns = j(`connect(state => ({ c: state.count }) })(App)`)
        .find(j.CallExpression).at(1)
        .findMapFunction();
      expect(j(fns.get()).toSource()).toEqual('state => ({ c: state.count })');
    });
    it('ref VariableDeclaration', () => {
      const fns = j(`const m = function(state) { return { c: state.count }; } connect(m)(App)`)
        .find(j.CallExpression).at(1)
        .findMapFunction();
      expect(j(fns.get()).toSource()).toEqual('function(state) { return { c: state.count }; }');
    });
    it('ref VariableDeclaration (ArrowFunctionExpression)', () => {
      const fns = j(`const m = state => ({ c: state.count }); connect(m)(App)`)
        .find(j.CallExpression).at(1)
        .findMapFunction();
      expect(j(fns.get()).toSource()).toEqual('state => ({ c: state.count })');
    });
    it('ref FunctionDeclaration', () => {
      const fns = j(`function m(state) { return { c: state.count }; } connect(m)(App)`)
        .find(j.CallExpression).at(1)
        .findMapFunction();
      expect(j(fns.get()).toSource()).toEqual('function m(state) { return { c: state.count }; }');
    });
  });

  describe('getModulesFromMapFunction', () => {
    it('params with Identifier', () => {
      const modules = j(`function A(state) { return { c: state.a, d:state.b.c } }`)
        .find(j.FunctionDeclaration)
        .getModulesFromMapFunction();
      expect(modules).toEqual(['a','b']);
    });
    it('params with ObjectPattern', () => {
      const modules = j(`function A({ a, b }) { }`)
        .find(j.FunctionDeclaration)
        .getModulesFromMapFunction();
      expect(modules).toEqual(['a', 'b']);
    });
  });

});
