import { parse } from './utils';

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
        models.push(parse(arg[0]));
      }
    });
    return models;
  };

  const models = findDvaModel(root);
  console.log(models);
  return root.toSource();
}
