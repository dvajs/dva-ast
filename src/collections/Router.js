import j from 'jscodeshift';
import Collection from 'jscodeshift/src/Collection';
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
    const routeByIds = {};
    const ROUTER_COMPONENTS = ['Router', 'Route', 'Redirect', 'IndexRedirect', 'IndexRoute'];

    function parse(node, parentPath = '', parentId, parentDepth = -1) {
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
      ret.depth = parentDepth + 1;
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

      // 有些特殊情况 id 会重复（同样的父子路由，出现在多处，可能父亲的父亲不一样）
      if (routeByIds[ret.id]) {
        ret.id = `${ret.id}_${Math.random()}`;
      }

      if (node.children) {
        ret.children = node.children
          .filter(node => node.type === 'JSXElement')
          .map(node => parse(node, ret.attributes.path, ret.id, ret.depth));
      }

      routeByIds[ret.id] = ret;

      return {
        id: ret.id,
        children: ret.children,
      };
    }

    function getAttributeValue(node) {
      if (node.type === 'Literal') {
        return node.value;
      } else if (node.expression.type === 'Identifier') {
        return node.expression.name;
      } else if (node.type === 'JSXExpressionContainer') {
        return j(node.expression).toSource();
      }
      throw new Error(`getRouterTree: unsupported attribute type`);
    }

    return this.simpleMap(path => ({
      tree: parse(path.node),
      routeByIds,
    }));
  },

};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};
