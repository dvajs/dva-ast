import { parseModel, parseContainer } from './utils';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const findDvaModel = (p) => {
    const models = [];
    /*
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
    */
    p.find(j.ObjectExpression)
      .forEach(obj => {
        if (obj.value.properties) {
          const properties = obj.value.properties.reduce((prev, curr) => {
            if (curr.type === 'Property') {
              return {
                ...prev,
                [curr.key.name]: true,
              };
            }
            return prev;
          }, {});

          if (properties.namespace && properties.state) {
            models.push(parseModel(obj.value));
          }
        }
      });
    return models;
  };

  if (file.path.indexOf('models') > -1) {
    const models = findDvaModel(root);
    if (models && models.length) {
      console.log('---------------- models ----------------');
      console.log(models);
    }
  }

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
    return containers;
  };

  const containers = findContainers(root);
  if (containers && containers.length) {
    console.log('---------------- containers ----------------');
    console.log(containers);
  }
  return root.toSource();
}
