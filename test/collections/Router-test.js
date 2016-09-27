import expect from 'expect';
import j from 'jscodeshift';
import Router from '../../src/collections/Router';

// Register methods.
Router.register();

describe('collections/Router', () => {

  describe('getRouterInfo', () => {
    it('simple', () => {
      const code = `<Router><Route path="/" component={App} /></Router>`;
      const tree = j(code).find(j.JSXElement).at(0).getRouterInfo();
      expect(tree).toEqual(
        [{"type":"Router","attributes":{},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"App"},"absolutePath":"/","id":"Route-/","children":[]}]}]
      );
    });
    it('complex', () => {
      const code = `
        <Router>
          <Route path="/" component={Home} />
          <Route path="/users">
            <Route path="list" component={UserList} />
            <Route path="edit" component={UserEdit} />
          </Route>
          <Route path="*" component={NotFoundPage} />
        </Router>`;
      const tree = j(code).find(j.JSXElement).at(0).getRouterInfo();
      expect(tree).toEqual(
        [{"type":"Router","attributes":{},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"Home"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"list","component":"UserList"},"absolutePath":"/users/list","id":"Route-/users/list","children":[]},{"type":"Route","attributes":{"path":"edit","component":"UserEdit"},"absolutePath":"/users/edit","id":"Route-/users/edit","children":[]}]},{"type":"Route","attributes":{"path":"*","component":"NotFoundPage"},"absolutePath":"/*","id":"Route-/*","children":[]}]}]
      );
    });
  });

  describe('findRouters', () => {
    it('import and Router', () => {
      expect(j(`import a from 'dva/router'; (<Router />)`).findRouters().size()).toEqual(1);
    });
    it('require and Router', () => {
      expect(j(`const a = require('dva/router'); (<Router />)`).findRouters().size()).toEqual(1);
    });
    it('Router', () => {
      expect(j(`(<Router />)`).findRouters().size()).toEqual(0);
    });
    it('import wrong', () => {
      expect(j(`import a from 'dva/xrouter'; (<Router />)`).findRouters().size()).toEqual(0);
    });
    it('no Router', () => {
      expect(j(`import a from 'dva/router'; (<Route />)`).findRouters().size()).toEqual(0);
    });
  });

});
