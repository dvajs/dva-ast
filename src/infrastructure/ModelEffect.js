import recast from 'recast';
import XNode from '../base/XNode';

export default class ModelEffect extends XNode {
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
    this.findActionTypeByCallee(node, 'put', (action) => {
      this.dispatches.push(action)
    });
  }
}
