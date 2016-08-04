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
    const dispatch = this.findDispatchParamName(node.params);
    if (!dispatch) {
      console.error('no dispatch params found in this subscription function');
      return;
    }

    this.findActionTypeByCallee(node, dispatch, (action) => {
      this.dispatches.push(action);
    });
  }
  findDispatchParamName(params) {
    if (params && params.length === 1 && params[0].type === 'Identifier') {
      return params[0].name;
    }
    return null;
  }
}
