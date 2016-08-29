import recast from 'recast';
import getReactUtils from './ReactUtils';

export default function (j) {
  const ReactUtils = getReactUtils(j);

  // get ObjectExpression property name
  const getPropertyKeyName = (key) => {
    let keyName;
    if (key.type === 'Identifier') {
      keyName = key.name;
    } else if (key.type === 'Literal') {
      keyName = key.value;
    }
    return keyName;
  };

  // parse literal
  const recursiveParse = (node) => {
    if (node.type === 'ObjectExpression') {
      return node.properties.reduce((obj, property) => ({
        ...obj,
        ...recursiveParse(property),
      }), {});
    }

    if (node.type === 'Property') {
      let propsName;
      if (node.key.type === 'Identifier') {
        propsName = node.key.name;
      }
      if (node.key.type === 'Literal') {
        propsName = node.key.value;
      }
      return {
        [propsName]: recursiveParse(node.value),
      };
    }

    if (node.type === 'Literal') {
      return node.value;
    }

    if (node.type === 'ArrayExpression') {
      return node.elements.map(recursiveParse);
    }

    if (node.type === 'FunctionExpression') {
      return node;
    }

    return null;
  };

  // didn't find api of jscodeshift for finding CallExpression from node
  // tried Collection.fromNodes([node]) but didn't work
  // finally use recast api instead.
  // maybe it would be better that we should parse the path of model here
  const analyzeAction = (param, cb) => {
    if (param.type === 'ObjectExpression') {
      param.properties.forEach(n => {
        if (n.key.name === 'type') {
          if (n.value.type === 'Literal') {
            cb(n.value.value);
          } else if (n.value.type === 'Identifier') {
            cb(n.value.name); // TODO, need to find constants
          }
        }
      });
    }
  };
  const findActionTypeByCallee = (node, calleeName, cb) => {
    recast.visit(node, {
      visitCallExpression(path) {
        const callee = path.node.callee;
        if (callee && callee.type === 'Identifier' && callee.name === calleeName) {
          const param = path.node.arguments[0];
          analyzeAction(param, cb);
          return false;
        }
        return path.node;
      },
    });
  };

  const findClosestCallExpression = (path) => {
    if (path.node.type === 'CallExpression') {
      return path.node;
    } else if (path.node.type === 'MemberExpression') {
      return findClosestCallExpression(path.parent);
    }
    return null;
  };

  const getSourceFromNode = (node) => recast.print(node).code;

  const findComponents = (root, cb) => {
    const componentsByCreateClass = ReactUtils.findReactCreateClass(root);
    const componentsByCreateClassExportDefault = ReactUtils.findReactCreateClassExportDefault(root);
    const componentsByCreateClassModuleExports = ReactUtils.findReactCreateClassModuleExports(root);
    const componentsByES6Class = ReactUtils.findReactES6ClassDeclaration(root);
    const componentsByPureFunction = ReactUtils.findPureReactComponents(root);

    if (componentsByCreateClass.size() > 0) {
      componentsByCreateClass.forEach(cb);
    }
    // TODO: this is not work when export default React.createClass
    if (componentsByCreateClassExportDefault.size() > 0) {
      componentsByCreateClassExportDefault.forEach(cb);
    }
    if (componentsByCreateClassModuleExports.size() > 0) {
      componentsByCreateClassModuleExports.forEach(cb);
    }
    if (componentsByES6Class.size() > 0) {
      componentsByES6Class.forEach(cb);
    }
    if (componentsByPureFunction.size() > 0) {
      componentsByPureFunction.forEach(cb);
    }
  };

  const findModels = (root, cb) => {
    root.find(j.ObjectExpression)
      .forEach(path => {
        if (path.value.properties) {
          const properties = path.value.properties.reduce((prev, curr) => {
            if (curr.type === 'Property') {
              return {
                ...prev,
                [curr.key.name]: true,
              };
            }
            return prev;
          }, {});
          if (properties.namespace && properties.state) {
            cb(path);
          }
        }
      });
  };

  const findRoutes = (root, cb) => {
    cb(root.find(j.JSXElement, {
      openingElement: {
        name: {
          type: 'JSXIdentifier',
          name: 'Router',
        }
      },
    }).at(0));
  };

  return {
    getPropertyKeyName,
    recursiveParse,
    analyzeAction,
    findActionTypeByCallee,
    findClosestCallExpression,
    getSourceFromNode,
    findComponents,
    findModels,
    findRoutes,
  };
}
