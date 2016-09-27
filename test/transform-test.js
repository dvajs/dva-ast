import j from 'jscodeshift';
import transform from '../src/transform';

describe('transform', () => {

  xit('normal', () => {
    const source = `
      import React from 'react';
      import dva from 'dva';
      import { Router } from 'dva/router';

      const app = dva();
      app.model({
        namespace: 'count',
        state: 0,
        reducers: {
          add(state) { return state + 1; },
          minus(state) { return state - 1; },
        },
        effects: {
          *addRemote() { yield put({ type: 'add' }); },
        },
        subscriptions: {
          setup() {
            dispatch({ type:'app/showLoading' });
            dispatch({ type:'addRemote' });
          },
        },
      });

      function Component() {
        function handleClick() {
          props.dispatch({ type: 'count/minus' });
        }
        return (<div></div>);
      }

      const AppPage = connect(state => ({
        count: state.count,
      }))(App);

      app.router(({ history }) => {
        return (
          <Router history={history}>
            <Route path="/" component={AppPage} />
          </Router>
        );
      });

      app.start('#root');
    `;
    const file = { source, path: './a/c.js' };
    const api = { jscodeshift: j };

    const result = transform(file, api);
    console.log(JSON.stringify(result, null, 2));
  });
});
