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
    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"type":"Router","attributes":{"history":"history"},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]}]},{"type":"Route","attributes":{"path":"Test","component":"Test"},"absolutePath":"/Test","id":"Route-/Test","children":[]}],"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
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

    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"type":"Router","attributes":{"history":"history"},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]},{"type":"Route","attributes":{"path":"Test","component":"Test"},"absolutePath":"/users/Test","id":"Route-/users/Test","children":[]}]}],"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
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

    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"type":"Router","attributes":{"history":"history"},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]}]},{"type":"IndexRoute","attributes":{"component":"Test"},"id":"IndexRoute-parentId_Router-root","children":[]}],"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });


  it('router.createRedirect', () => {
    prepareRouterjs();

    const result = api('router.createRedirect', {
      filePath,
      sourcePath: __dirname,
      from: '/a/b',
      to: '/a/c',
    });

    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"type":"Router","attributes":{"history":"history"},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]}]},{"type":"Redirect","attributes":{"from":"/a/b","to":"/a/c"},"id":"Redirect-parentId_Router-root","children":[]}],"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.createIndexRedirect', () => {
    prepareRouterjs();

    const result = api('router.createIndexRedirect', {
      filePath,
      sourcePath: __dirname,
      to: '/a/c',
    });

    expect(result).toEqual({"models":{"data":[],"reducerByIds":{},"effectByIds":{},"subscriptionByIds":{}},"router":{"type":"Router","attributes":{"history":"history"},"id":"Router-root","children":[{"type":"Route","attributes":{"path":"/","component":"IndexPage"},"absolutePath":"/","id":"Route-/","children":[]},{"type":"Route","attributes":{"path":"/users","component":"UserPage"},"absolutePath":"/users","id":"Route-/users","children":[{"type":"Route","attributes":{"path":"user","component":"UserDetailPage"},"absolutePath":"/users/user","id":"Route-/users/user","children":[]}]},{"type":"IndexRedirect","attributes":{"to":"/a/c"},"id":"IndexRedirect-parentId_Router-root","children":[]}],"filePath":"./tmp/router.js"},"routeComponents":[],"dispatches":{}});
  });

  it('router.remove', () => {
    prepareRouterjs();

    const result = api('router.remove', {
      filePath,
      sourcePath: __dirname,
      id: 'Route-/',
    });

    expect(result).toEqual({});
  });
});
