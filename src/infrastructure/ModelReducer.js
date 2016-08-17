import recast from 'recast';
import XNode from '../base/XNode';

export default class ModelReducer extends XNode {
  constructor({ node, jscodeshift, filePath }) {
    super();
    this.j = jscodeshift;
    this.node = node;
    this.data = null;
    this.filePath = filePath;
    if (node) {
      this.parse(node);
    }
  }
  parse(node) {
    if (node.type !== 'FunctionExpression') {
      console.error('unsupported type of dva model reducers');
      return;
    }
    this.data = recast.print(node).code;
  }
}
