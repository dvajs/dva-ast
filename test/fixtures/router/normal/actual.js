import { Router, Route } from 'dva/router';

function A() {
  return <div>A</div>;
}

function B() {
  return <div>B</div>;
}

export default function({ history }) {
  return (
    <Router history={ history }>
      <Route path="/" component={A} />
      <Route path="/b">
        <Route path="/test" component={B} />
      </Route>
    </Router>
  );
}
