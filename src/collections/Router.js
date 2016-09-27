import j from 'jscodeshift';
import Collection from 'jscodeshift/dist/Collection';
import once from 'lodash.once';
import assert from 'assert';
import Helper from './Helper';

Helper.register();

const methods = {

  findRouters() {
    if (!this.hasModule('dva/router')) return Collection.fromPaths([], this);
    return this.find(j.JSXElement, {
      openingElement: {
        name: {
          type: 'JSXIdentifier',
          name: 'Router',
        },
      },
    });
  },

  // TODO: support config router with JavaScript Object
  getRouterInfo() {
    const ROUTER_COMPONENTS = ['Router', 'Route', 'Redirect', 'IndexRedirect', 'IndexRoute'];

    function parse(node, parentPath = '', parentId) {
      assert(
        node.type === 'JSXElement',
        `getRouterTree: node should be JSXElement, but got ${node.type}`
      );
      const name = node.openingElement.name.name;
      assert(
        ROUTER_COMPONENTS.indexOf(name) > -1,
        `getRouterTree: component should be one of ${ROUTER_COMPONENTS.join(', ')}`
      );

      const ret = { type: name };

      ret.attributes = j(node.openingElement)
        .find(j.JSXAttribute)
        .simpleMap(path => {
          const node = path.node;
          return {
            name: node.name.name,
            value: getAttributeValue(node.value),
          };
        })
        .reduce((memo, { name, value }) => {
          memo[name] = value;
          return memo;
        }, {});

      const path = ret.attributes.path;
      if (path) {
        ret.absolutePath = path.charAt(0) === '/' ? path : `${parentPath}/${path}`;
      }

      if (ret.absolutePath) {
        ret.id = `${ret.type}-${ret.absolutePath}`;
      } else if (parentId) {
        ret.id = `${ret.type}-parentId_${parentId}`;
      } else {
        ret.id = `${ret.type}-root`;
      }

      if (node.children) {
        ret.children = node.children
          .filter(node => node.type === 'JSXElement')
          .map(node => parse(node, ret.attributes.path, ret.id));
      }

      return ret;
    }

    function getAttributeValue(node) {
      if (node.type === 'Literal') {
        return node.value;
      } else if (node.type === 'JSXExpressionContainer' &&
        node.expression.type === 'Identifier') {
        // TODO: Identifier 时应该如何展现? Router 应该处理和 Component 之间的关系
        return node.expression.name;
      }
      throw new Error(`getRouterTree: unsupported attribute type`);
    }

    return this.simpleMap(path => parse(path.node));
  },

};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};

