import { parseModel, parseContainer } from './utils';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const findDvaModel = (p) => {
    const models = [];
    p.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'app' },
        property: { type: 'Identifier', name: 'model' },
      },
    }).forEach(p => {
      const arg = p.node.arguments;
      if (arg.length === 1 && arg[0].type === 'ObjectExpression') {
        models.push(parseModel(arg[0]));
      }
    });
    return models;
  };

  const models = findDvaModel(root);
  // console.log(models);

  // find those components with connects
  const findContainers = (p) => {
    const containers = [];
    p.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'connect',
      },
    }).forEach(p => {
      containers.push(parseContainer(p, j));
    });
  };

  const containers = findContainers(root);
  // console.log(containers);
  return root.toSource();
}
