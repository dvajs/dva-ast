import j from 'jscodeshift';

const code = `
function d() {}
const b = 2;
function A({ c }) {
  const a = 1;
  dispatch(a);
}
`;

const c = j(code)
  .find(j.CallExpression)
  .forEach(path => {
    const scope = path.scope.lookup('c');
    const p = scope.getBindings()['c'];

    let c = p[0].parentPath;
    while (c.name !== 'params') {
      c = c.parentPath;
    }
    console.log(c);
  });

//console.log(c);
