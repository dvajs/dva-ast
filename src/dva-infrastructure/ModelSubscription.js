import recast from 'recast';
import XNode from '../base/XNode';

export default class ModelSubscription extends XNode {
  constructor({ node, jscodeshift }) {
    super();
    this.j = jscodeshift;
    this.node = node;
    this.data = null;
    this.dispatches = [];
    if (node) {
      this.parse(node);
    }
  }
  parse(node) {
    if (node.type !== 'FunctionExpression') {
      console.error('unsupported type of dva model subscriptions');
      return;
    }

    this.data = recast.print(node).code;
    this.findDispatches(node);
  }
  findDispatches(node) {
    const dispatches = this.dispatches;
    const dispatch = this.findDispatchParamName(node.params);
    if (!dispatch) {
      console.error('no dispatch params found in this subscription function');
      return;
    }

    // didn't find api of jscodeshift for finding CallExpression from node
    // tried Collection.fromNodes([node]) but didn't work
    // finally use recast api instead.
    recast.visit(node, {
      visitCallExpression(path) {
        const callee = path.node.callee;
        if (callee && callee.type === 'Identifier' && callee.name === dispatch) {
          const param = path.node.arguments[0];

          if (param.type === 'ObjectExpression') {
            param.properties.forEach(n => {
              if (n.key.name === 'type') {
                if (n.value.type === 'Literal') {
                  dispatches.push(n.value.value);
                }

                if (n.value.type === 'Identifier') {
                  // TODO, need to find constants
                  dispatches.push(n.value.name);
                }
              }
            });
          }

          return false;
        }
        return path.node;
      },
    });
  }
  findDispatchParamName(params) {
    if (params && params.length === 1 && params[0].type === 'Identifier') {
      return params[0].name;
    }
    return null;
  }
}
