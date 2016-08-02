import XNode from '../base/XNode';
import ModelSubscription from './ModelSubscription';
import ModelEffect from './ModelEffect';
import ModelReducer from './ModelReducer';

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
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model effects');
      return;
    }
    this.data.effects = node.properties.reduce((effect, curr) => {
      let actionName;
      if (curr.key.type === 'Literal') {
        actionName = curr.key.value;
      } else if (curr.key.type === 'Identifier') {
        actionName = curr.key.name;
      }

      return {
        ...effect,
        [actionName]: new ModelEffect({ node: curr.value, jscodeshift: this.j })
      }
    }, {});
  }
  parseReducers(node) {
    if (node.type !== 'ObjectExpression') {
      console.error('unsupported type of dva model reducers');
      return;
    }

    this.data.reducers = node.properties.reduce((reducer, curr) => {
      let actionName;
      if (curr.key.type === 'Literal') {
        actionName = curr.key.value;
      } else if (curr.key.type === 'Identifier') {
        actionName = curr.key.name;
      }

      return {
        ...reducer,
        [actionName]: new ModelReducer({ node: curr.value, jscodeshift: this.j })
      }
    }, {});
  }
}
