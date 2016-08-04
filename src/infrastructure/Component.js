import recast from 'recast';
import XNode from '../base/XNode';
import ComponentConnect from './ComponentConnect';

export default class Component extends XNode {
  constructor({ nodePath, jscodeshift, filePath, root }) {
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
    this.findConnect();
    this.findDispatches();
  }
  findConnect() {
    const connects = this.root.find(this.j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'connect', // TODO: should consider alias
      },
    });

    if (connects.size() > 0) {
      // TODO, need to find the right connect for current component when there's muiltple connects
      if (connects.size() > 1) {
        console.error('There\'s muiltple connects in this file !');
        return;
      }
      this.connect = new ComponentConnect({
        nodePath: connects.get(0),
        jscodeshift: this.j,
        component: this,
      });
    }
  }
  findDispatches() {
    // TODO, need to find all possible dispatches
  }
}
