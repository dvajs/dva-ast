import api from '../../src/api/index';
import expect from 'expect';
import { removeSync, outputFileSync } from 'fs-extra';
import { join, dirname } from 'path';

describe('api/routeComponents', () => {
  const filePath = './tmp/router.js';
  const absFilePath = join(__dirname, filePath);

  afterEach(() => {
    removeSync(dirname(absFilePath));
  });

  const prepareRouterjs = () => {
    outputFileSync(absFilePath,
`import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'dva/router';
import IndexPage from './routes/IndexPage';
import UserPage from './routes/UserPage';
import UserDetailPage from './routes/UserDetailPage';

export default function({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={IndexPage} />
      <Route path="/users" component={UserPage} >
        <Route path="user" component={UserDetailPage} />
      </Route>
    </Router>
  );
};`);
  };

  const componentFilePath = './tmp/ccccc/Test.jsx';
  const prepareComponent = () => {
    api('routeComponents.create', {
      filePath: componentFilePath,
      sourcePath: __dirname,
      componentName: 'Test',
    });
  }

  it('router.createRoute: without parent', () => {
    prepareRouterjs();
    prepareComponent();

    const result = api('router.createRoute', {
      filePath,
      sourcePath: __dirname,
      path: 'Test',
      component: {
        componentName: 'Test',
        filePath: componentFilePath,
      },
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"Route-/Test","children":[]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Route-/users/user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},"Route-/Test":{"type":"Route","depth":1,"attributes":{"path":"Test","component":"Test"},"absolutePath":"/Test","id":"Route-/Test","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"Route-/Test","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.createRoute: with parentId', () => {
    prepareRouterjs();
    prepareComponent();

    const result = api('router.createRoute', {
      filePath,
      sourcePath: __dirname,
      parentId: 'Route-/users',
      path: 'Test',
      component: {
        componentName: 'Test',
        filePath: componentFilePath,
      },
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]},{"id":"Route-/users/Test","children":[]}]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Route-/users/user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},"Route-/users/Test":{"type":"Route","depth":2,"attributes":{"path":"Test","component":"Test"},"absolutePath":"/users/Test","id":"Route-/users/Test","children":[]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"id":"Route-/users/user","children":[]},{"id":"Route-/users/Test","children":[]}]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]},{"id":"Route-/users/Test","children":[]}]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.createIndexRoute', () => {
    prepareRouterjs();
    prepareComponent();

    const result = api('router.createIndexRoute', {
      filePath,
      sourcePath: __dirname,
      component: {
        componentName: 'Test',
        filePath: componentFilePath,
      },
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"IndexRoute-parentId_Router-root","children":[]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Route-/users/user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},"IndexRoute-parentId_Router-root":{"type":"IndexRoute","depth":1,"attributes":{"component":"Test"},"id":"IndexRoute-parentId_Router-root","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"IndexRoute-parentId_Router-root","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });


  it('router.createRedirect', () => {
    prepareRouterjs();

    const result = api('router.createRedirect', {
      filePath,
      sourcePath: __dirname,
      from: '/a/b',
      to: '/a/c',
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"Redirect-parentId_Router-root","children":[]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Route-/users/user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},"Redirect-parentId_Router-root":{"type":"Redirect","depth":1,"attributes":{"from":"/a/b","to":"/a/c"},"id":"Redirect-parentId_Router-root","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"Redirect-parentId_Router-root","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.createIndexRedirect', () => {
    prepareRouterjs();

    const result = api('router.createIndexRedirect', {
      filePath,
      sourcePath: __dirname,
      to: '/a/c',
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"IndexRedirect-parentId_Router-root","children":[]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Route-/users/user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},"IndexRedirect-parentId_Router-root":{"type":"IndexRedirect","depth":1,"attributes":{"to":"/a/c"},"id":"IndexRedirect-parentId_Router-root","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]},{"id":"Route-/users","children":[{"id":"Route-/users/user","children":[]}]},{"id":"IndexRedirect-parentId_Router-root","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.remove', () => {
    prepareRouterjs();

    const result = api('router.remove', {
      filePath,
      sourcePath: __dirname,
      id: 'Route-/users',
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[]}]},"routeByIds":{"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}})
  });

  it('router.moveTo', () => {
    prepareRouterjs();

    const result = api('router.moveTo', {
      filePath,
      sourcePath: __dirname,
      id: 'Route-/users/user',
      parentId: 'Route-/',
    });
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"tree":{"id":"Router-root","children":[{"id":"Route-/","children":[{"id":"Route-//user","children":[]}]},{"id":"Route-/users","children":[]}]},"routeByIds":{"Route-//user":{"type":"Route","depth":2,"attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"//user","id":"Route-//user","children":[]},"Route-/":{"type":"Route","depth":1,"attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[{"id":"Route-//user","children":[]}]},"Route-/users":{"type":"Route","depth":1,"attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[]},"Router-root":{"type":"Router","depth":0,"attributes":{"history":"history"},"id":"Router-root","children":[{"id":"Route-/","children":[{"id":"Route-//user","children":[]}]},{"id":"Route-/users","children":[]}]}},"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });
});
