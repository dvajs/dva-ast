import j from 'jscodeshift';
import once from 'lodash.once';
import assert from 'assert';
import Helper from './Helper';
import * as utils from '../utils/index';

Helper.register();

const _check = (node, name) => {
  return (node.type === 'Identifier' && node.name === name) ||
    (node.type === 'Literal' && node.value === name);
};

const methods = {

  findModels(namespace) {
    return this.find(j.ObjectExpression, node => {
      const props = node.properties.reduce((memo, prop) => {
        if (j.Property.check(prop)) {
          if (prop.key.name === 'namespace') {
            if (!j.Literal.check(prop.value)) {
              return {};
            }
            memo[prop.key.name] = prop.value.value;
          } else {
            memo[prop.key.name] = true;
          }
        }
        return memo;
      }, {});

      if (!props.namespace) return false;
      if (namespace && props.namespace !== namespace) return false;
      // state 不是必须的
      // 但为增加准确性, 还需要声明除 namespace 以外的其他任一项
      return props.state ||
        props.reducers ||
        props.effects ||
        props.subscriptions;
    });
  },

  updateNamespace(newNamespace) {
    return this.forEach(path => {
      path.node.properties.forEach(prop => {
        if (j.Property.check(prop) && prop.key.name === 'namespace') {
          prop.value = j.literal(newNamespace);
        }
      });
    });
  },

  updateState(source) {
    return this.forEach(path => {
      path.node.properties.forEach(prop => {
        if (j.Property.check(prop) && prop.key.name === 'state') {
          prop.value = utils.getExpression(source);
        }
      });
    });
  },

  addReducer(name, source) {
    this._addModelItem(name, source, {
      itemsKey: 'reducers',
      defaultSource: 'function(state) {\n  return state;\n}',
    });
  },

  addEffect(name, source) {
    this._addModelItem(name, source, {
      itemsKey: 'effects',
      defaultSource: '*function(action, { call, put, select }) {\n}',
    });
  },

  addSubscription(name, source) {
    this._addModelItem(name, source, {
      itemsKey: 'subscriptions',
      defaultSource: 'function({ dispatch, history }) {\n}',
    });
  },

  /**
   * @private
   */
  _addModelItem(name, source, { itemsKey, defaultSource }) {
    return this.forEach(path => {
      let items = null;
      path.node.properties.forEach(prop => {
        if (j.Property.check(prop) && prop.key.name === itemsKey) {
          assert(
            j.ObjectExpression.check(prop.value),
            `_addModelItem: ${itemsKey} should be ObjectExpression, but got ${prop.value.type}`
          );
          items = prop;
        }
      });

      if (!items) {
        items = j.property(
          'init',
          j.identifier(itemsKey),
          j.objectExpression([])
        );
        path.node.properties.push(items);
      }

      const item = j.property(
        'init',
        j.identifier(name),
        utils.getExpression(source || defaultSource)
      );
      items.value.properties.push(item);
    });
  },

  updateReducer(name, source) {
    this._updateModelItem(name, source, {
      itemsKey: 'reducers',
    });
  },

  updateEffect(name, source) {
    this._updateModelItem(name, source, {
      itemsKey: 'effects',
    });
  },

  updateSubscription(name, source) {
    this._updateModelItem(name, source, {
      itemsKey: 'subscriptions',
    });
  },

  /**
   * @private
   */
  _updateModelItem(name, source, { itemsKey }) {
    return this.forEach(path => {
      let items = null;
      path.node.properties.forEach(prop => {
        if (j.Property.check(prop) && prop.key.name === itemsKey) {
          assert(
            j.ObjectExpression.check(prop.value),
            `_updateModelItem: ${itemsKey} should be ObjectExpression, but got ${prop.value.type}`
          );
          items = prop;
        }
      });
      assert(items, `_updateModelItem: ${itemsKey} not found`);

      let updated = false;
      items.value.properties.forEach(prop => {
        if (j.Property.check(prop) && _check(prop.key, name)) {
          updated = true;
          prop.value = utils.getExpression(source);
        }
      });
      assert(updated, `_updateModelItem: ${itemsKey}.${name} not found`);
    });
  },

  removeReducer(name) {
    this._removeModelItem(name, {
      itemsKey: 'reducers',
    });
  },

  removeEffect(name) {
    this._removeModelItem(name, {
      itemsKey: 'effects',
    });
  },

  removeSubscription(name) {
    this._removeModelItem(name, {
      itemsKey: 'subscriptions',
    });
  },

  /**
   * @private
   */
  _removeModelItem(name, { itemsKey }) {
    return this.forEach(path => {
      let items = null;
      path.node.properties.forEach(prop => {
        if (j.Property.check(prop) && prop.key.name === itemsKey) {
          assert(
            j.ObjectExpression.check(prop.value),
            `_removeModelItem: ${itemsKey} should be ObjectExpression, but got ${prop.value.type}`
          );
          items = prop;
        }
      });
      assert(items, `_removeModelItem: ${itemsKey} not found`);

      let removed = false;
      items.value.properties = items.value.properties.filter(prop => {
        if (j.Property.check(prop) && _check(prop.key, name)) {
          removed = true;
          return false;
        }
        return true;
      });
      assert(removed, `_removeModelItem: ${itemsKey}.${name} not found`);
    });
  },

  getModelInfo() {
    const defaultModel = {
      reducers: [],
      effects: [],
      subscriptions: [],
    };
    return this.simpleMap(path => {
      const node = path.node;
      const result = node.properties.reduce((memo, prop) => {
        const name = prop.key.name;
        switch (name) {
          case 'namespace':
            memo[name] = prop.value.value;
            return memo;
          case 'state':
            memo[name] = utils.recursiveParse(prop.value);
            return memo;
          case 'reducers':
            memo[name] = parseReducers(prop.value);
            return memo;
          case 'effects':
            memo[name] = parseEffects(prop.value);
            return memo;
          case 'subscriptions':
            memo[name] = parseSubscriptions(prop.value);
            return memo;
          default:
            throw new Error(`getModelProperties: unrecognized property of dva model: ${name}`);
        }
      }, defaultModel);

      // TODO: reducers 等的解析支持 VariableDeclaraction
      // TODO: reducers 等的解析支持通过 import 从外部引入
      // TODO: add id for reducers, effects and subscriptions
      return result;
    });

    function parseBasic(node, parseType, extra) {
      assert(
        node.type === 'ObjectExpression',
        `getModelProperties: ${parseType} should be ObjectExpression, but got ${node.type}`
      );
      return node.properties.map(prop => {
        const name = utils.getPropertyValue(prop.key);
        const result = {
          name,
          source: j(prop.value).toSource(),
        };
        if (extra) {
          extra(result, prop.value);
        }
        return result;
      });
    }

    function parseReducers(node) {
      return parseBasic(node, 'reducers');
    }

    function parseEffects(node) {
      return parseBasic(node, 'effects', (result, node) => {
        result.dispatches = j(node).findDispatchCalls().getActionTypeFromCall();
      });
    }

    function parseSubscriptions(node) {
      return parseBasic(node, 'subscriptions', (result, node) => {
        result.dispatches = j(node).findDispatchCalls().getActionTypeFromCall();
      });
    }
  },
};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};
