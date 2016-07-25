import { parseState } from './utils';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const findDvaImports = (p) => {
    return p.find(j.ImportDefaultSpecifier)
      .filter(p => p.node.local.name === 'dva');
  };

  const findDvaApp = (p) => {
    const apps = [];
    p.find(j.CallExpression, { callee: {name: 'dva'} })
      .forEach(p => {
        if (p.parent.node.type === 'VariableDeclarator') {
          apps.push(p.parent);
        }
      });
    return apps;
  };

  const findDvaModel = (p) => {
    const models = [];
    p.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {type: 'Identifier', name: 'app'},
        property: {type: 'Identifier', name: 'model'}
      }
    }).forEach(p => {
      const arg = p.node.arguments;
      if (arg.length === 1 && arg[0].type === 'ObjectExpression') {
        const model = {};
        arg[0].properties.forEach(pr => {
          if (pr.key.name === 'namespace') {
            model.namespace = pr.value.value;
          }
          if (pr.key.name === 'state') {
            model.state = parseState(pr);
          }
        });
        models.push(model);
      }
    });
    return models;
  };

  const models = findDvaModel(root);

  return root.toSource();
};
