import { parseModel, parseContainer } from './utils';
import DvaModel from './infrastructure/Model';
import DvaComponent from './infrastructure/Component';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const ReactUtils = require('./utils/ReactUtils')(j);

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
            models.push(new DvaModel({ node: obj.value, jscodeshift: j }));
          }
        }
      });
    return models;
  };

  if (file.path.indexOf('models') > -1) {
    const models = findDvaModel(root);
    // console.log('---------------- models ----------------');
    // console.log(models[0].data)
  }

  // find components and connects
  const components = [];
  const componentsByCreateClass = ReactUtils.findReactCreateClass(root);
  const componentsByES6Class = ReactUtils.findReactES6ClassDeclaration(root);


  // TODO: there's an bug in ReactUtils which didn't find those componets like
  /*
  module.exports = React.createClass()
  export default React.createClass()
  */
  if (componentsByCreateClass.size() > 0) {
    componentsByCreateClass.forEach(path => {
      components.push(new DvaComponent({ nodePath: path, jscodeshift: j, filePath: file.path }));
    });
  }

  if (componentsByES6Class.size() > 0) {
    componentsByES6Class.forEach(path => {
      components.push(new DvaComponent({ nodePath: path, jscodeshift: j, filePath: file.path }));
    });
  }

  if (components.length) {
    console.log('---------------- components ----------------');
    components.map(c => {
      console.log(`${c.filePath}: ${c.componentName}`)
      console.log(c.data);
    });
  }

  // const findContainers = (p) => {
  //   const containers = [];
  //   p.find(j.CallExpression, {
  //     callee: {
  //       type: 'Identifier',
  //       name: 'connect',
  //     },
  //   }).forEach(p => {
  //     containers.push(parseContainer(p, j));
  //   });
  //   return containers;
  // };
  //
  // const containers = findContainers(root);
  // if (containers && containers.length) {
  //   console.log('---------------- containers ----------------');
  //   console.log(containers);
  // }
  return null;
}
