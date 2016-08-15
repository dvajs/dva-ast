import recast from 'recast';

export default class XNode {

  // get ObjectExpression property name
  getPropertyKeyName(key) {
    let keyName;
    if (key.type === 'Identifier') {
      keyName = key.name;
    }
    if (key.type === 'Literal') {
      keyName = key.value;
    }
    return keyName;
  }

  // parse literal
  recursiveParse = (node) => {
    if (node.type === 'ObjectExpression') {
      return node.properties.reduce((obj, property) => ({
        ...obj,
        ...this.recursiveParse(property),
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
        [propsName]: this.recursiveParse(node.value),
      };
    }

    if (node.type === 'Literal') {
      return node.value;
    }

    if (node.type === 'ArrayExpression') {
      return node.elements.map(this.recursiveParse);
    }

    if (node.type === 'FunctionExpression') {
      return node;
    }

    return null;
  }

  // didn't find api of jscodeshift for finding CallExpression from node
  // tried Collection.fromNodes([node]) but didn't work
  // finally use recast api instead.
  // maybe it would be better that we should parse the path of model here
  findActionTypeByCallee(node, calleeName, cb) {
    const analyzeAction = this.analyzeAction;
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
  }
  analyzeAction(param, cb) {
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
  }

  findClosestCallExpression(path) {
    if (path.node.type === 'CallExpression') {
      return path.node;
    } else if (path.node.type === 'MemberExpression') {
      return this.findClosestCallExpression(path.parent);
    }
    return null;
  }

  // save to source file
  save() {
    this.j.toSource();
  }
}
