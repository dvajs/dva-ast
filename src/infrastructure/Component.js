import recast from 'recast';
import XNode from '../base/XNode';
import ComponentConnect from './ComponentConnect';

export default class Component extends XNode {
  constructor({ nodePath, jscodeshift, filePath, root }) {
    super();
    this.j = jscodeshift;
    this.node = nodePath.node;
    this.filePath = filePath;
    this.data = null;
    this.dispatches = [];
    this.connects = [];
    this.componentName = null;
    if (nodePath) {
      this.parse(nodePath.node, root);
    }
  }
  parse(node, root) {
    this.data = recast.print(node).code;
    if (node.type === 'VariableDeclarator') {
      this.componentName = node.id.name;
    } else if (node.type === 'ClassDeclaration') {
      this.componentName = node.id.name;
    } else if (node.type === 'FunctionDeclaration') {
      this.componentName = node.id.name;
    }

    this.findConnect(root);
    this.findDispatches(root);
  }
  findConnect(root) {
    const connects = root.find(this.j.CallExpression, {
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
      this.connects.push(new ComponentConnect({
        nodePath: connects.get(0),
        jscodeshift: this.j,
      }));
    }
  }
  findDispatches(root) {
    const dispatchMap = {};
    root.find(this.j.Identifier, {
      name: 'dispatch',
    }).forEach(p => {
      const parentNode = p.parent.node;
      let actionObject = null;
      if (parentNode.type === 'CallExpression') {
        actionObject = parentNode.arguments[0];
      } else if (parentNode.type === 'MemberExpression') {
        const callNode = this.findClosestCallExpression(p.parent);
        actionObject = callNode && callNode.arguments ? callNode.arguments[0] : null;
      }
      if (actionObject) {
        this.analyzeAction(actionObject, (actionType) => {
          dispatchMap[actionType] = true;
        });
      }
    });

    this.dispatches = Object.keys(dispatchMap);
  }
}
