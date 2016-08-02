import XNode from '../base/XNode';
import ModelSubscription from './ModelSubscription';

export default class Model extends XNode {
  constructor({ node, jscodeshift }) {
    super();
    this.j = jscodeshift;
    this.node = node;
    this.data = {
      namespace: null,
      state: null,
      subscriptions: null,
      effects: null,
      reducers: null,
    };
    if (node) {
      this.parse(node);
    }
  }
  parse(node) {
    if (node.type !== 'ObjectExpression') return null;
    node.properties.forEach(n => this.switchParser(n));
    return null;
  }
  switchParser(node) {
    const propertyName = this.getPropertyKeyName(node.key);
    if (propertyName === 'namespace') {
      this.parseNamespace(node.value);
    } else if (propertyName === 'state') {
      this.parseState(node.value);
    } else if (propertyName === 'subscriptions') {
      this.parseSubscriptions(node.value);
    } else if (propertyName === 'effects') {
      this.parseEffects(node.value);
    } else if (propertyName === 'reducers') {
      this.parseReducers(node.value);
    } else {
      console.error('unrecognized property of dva model: %s', propertyName);
    }
  }
  parseNamespace(node) {
    if (node.type !== 'Literal') {
      console.error('unsupported type of dva model namespace');
      return;
    }
    this.data.namespace = node.value;
  }
  parseState(node) {
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model state');
      return;
    }
    this.data.state = this.recursiveParse(node);
  }
  parseSubscriptions(node) {
    if (node.type !== 'ArrayExpression') {
      console.error('unsupported type of dva model subscriptions');
      return;
    }
    this.data.subscriptions = node.elements.map(
      n => new ModelSubscription({ node: n, jscodeshift: this.j })
    );
  }
  parseEffects(node) {

  }
  parseReducers(node) {

  }
}
