import recast from 'recast';
import XNode from '../base/XNode';

export default class Component extends XNode {
  constructor({ nodePath, jscodeshift, filePath }) {
    super();
    this.j = jscodeshift;
    this.nodePath = nodePath;
    this.root = root;
    this.filePath = filePath;
    this.data = null;
    this.componentName = null;
    if (nodePath) {
      this.parse(nodePath.node);
    }
  }
  parse(node) {
    this.data = recast.print(node).code;
    if (node.type === 'VariableDeclarator') {
      this.componentName = node.id.name;
    } else if (node.type === 'ClassDeclaration') {
      this.componentName = node.id.name;
    }
  }
}
