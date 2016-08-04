import getReactUtils from './utils/ReactUtils';
import DvaModel from './infrastructure/Model';
import DvaComponent from './infrastructure/Component';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const ReactUtils = getReactUtils(j);
  const transformInfo = {
    models: null,
    components: null,
  };

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
    transformInfo.models = findDvaModel(root);
  }

  // find components and connects
  const components = [];
  const addComponent = (path) => {
    components.push(
      new DvaComponent({ nodePath: path, jscodeshift: j, filePath: file.path, root })
    );
  };
  if (ReactUtils.hasReact(root)) {
    const componentsByCreateClass = ReactUtils.findReactCreateClass(root);
    const componentsByCreateClassExportDefault = ReactUtils.findReactCreateClassExportDefault(root);
    const componentsByCreateClassModuleExports = ReactUtils.findReactCreateClassModuleExports(root);
    const componentsByES6Class = ReactUtils.findReactES6ClassDeclaration(root);
    const componentsByPureFunction = ReactUtils.findPureReactComponents(root);

    if (componentsByCreateClass.size() > 0) {
      componentsByCreateClass.forEach(addComponent);
    }
    // TODO: this is not work when exprot default React.createClass
    if (componentsByCreateClassExportDefault.size() > 0) {
      componentsByCreateClassExportDefault.forEach(addComponent);
    }
    if (componentsByCreateClassModuleExports.size() > 0) {
      componentsByCreateClassModuleExports.forEach(addComponent);
    }
    if (componentsByES6Class.size() > 0) {
      componentsByES6Class.forEach(addComponent);
    }
    if (componentsByPureFunction.size() > 0) {
      componentsByPureFunction.forEach(addComponent);
    }

    if (components.length) {
      transformInfo.components = components;
    }
  }
  return [null, transformInfo];
}
