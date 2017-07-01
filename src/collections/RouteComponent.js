import j from 'jscodeshift';
import Collection from 'jscodeshift/src/Collection';
import once from 'lodash.once';
import flatten from 'lodash.flatten';
import assert from 'assert';
import * as utils from '../utils/index';
import Helper from './Helper';

Helper.register();

export const UNRESOLVED_IDENTIFIER = '__UNRESOLVED_IDENTIFIER__';

const { NodePath } = j.types;

const methods = {

  findRouteComponents() {
    if (!this.hasReactModule()) return Collection.fromPaths([], this);

    const pathes = [];

    // 支持 ES6 Class
    this.find(j.ClassDeclaration).forEach(path => {
      const superClass = path.node.superClass;
      if (superClass) {
        if (
          // TODO: 处理 Component 和 React.Component 的来源信赖问题
          // class A extends Component {}
          (j.Identifier.check(superClass) && superClass.name === 'Component') ||
          // class A extends React.Component {}
          (j.MemberExpression.check(superClass) && isReactComponent(superClass))
        ) {
          pathes.push(path);
        }
      }
    });

    this.find(j.FunctionDeclaration).forEach(path => {
      if (hasJSXElement(path)) pathes.push(path);
    });

    // 支持 pure function
    this.find(j.VariableDeclarator, {
      init: {
        type: 'ArrowFunctionExpression',
      }
    }).forEach(path => {
      if (hasJSXElement(path)) pathes.push(path);
    });

    function isReactComponent(node) {
      return node.property.name === 'Component' &&
          node.object.name === 'React';
    }
    function hasJSXElement(path) {
      return j(path).find(j.JSXElement).size() > 0;
    }

    return Collection.fromPaths(pathes, this);
  },

  findDispatchCalls() {
    function filterDispatch(path) {
      // TODO: 识别 dispatch 和 put 的 alias
      return path.name === 'dispatch' ||
        path.name === 'put';
    }
    return this
      .find(j.Identifier, filterDispatch)
      .closest(j.CallExpression);
  },

  findConnects() {
    // TODO: 识别 connect alias
    return this.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'connect',
      },
    });
  },

  findMapFunction() {
    return this.map(path => {
      const mapFnNode = path.value.arguments[0];
      if (!mapFnNode) return null;

      switch (mapFnNode.type) {
        case 'ArrowFunctionExpression':
        case 'FunctionExpression':
          return new NodePath(mapFnNode);
        case 'Identifier':
          const scope = path.scope.lookup(mapFnNode.name);
          if (scope) {
            const newPath = scope.getBindings()[mapFnNode.name][0];
            const p = newPath.parent;
            const pNode = p.value;
            if (pNode.type === 'VariableDeclarator') {
              if (pNode.init.type === 'FunctionExpression' ||
                  pNode.init.type === 'ArrowFunctionExpression') {
                return new NodePath(pNode.init);
              }
            }
            if (pNode.type === 'FunctionDeclaration') {
              return p;
            }
          }
          throw new Error(`findMapFunction: unresolved`);
        default:
          throw new Error(`findMapFunction: unsupported path type ${mapFnNode.type}`);
      }
    });
  },

  getRouteComponentInfo(root) {
    return this.simpleMap(path => {
      return {
        name: j(path).getFirstComponentName(),
        source: root.toSource(),
        stateMappings: (() => {
          const mapFunctions = root.findConnects().findMapFunction();
          if (mapFunctions) {
            return mapFunctions.getModulesFromMapFunction();
          }
          return [];
        })(),
        dispatches: j(path).findDispatchCalls().getActionTypeFromCall(),
      };
    });
  },

  getFirstComponentName() {
    const node = this.get().value;
    switch (node.type) {
      case 'VariableDeclarator':
      case 'ClassDeclaration':
      case 'FunctionDeclaration':
        return node.id.name;
      case 'FunctionExpression':
        assert(
          node.id && node.id.name,
          'getFirstComponentName: component should not be anonymous'
        );
        return node.id.name;
      default:
        throw new Error('getFirstComponentName: unsupported node.type');
    }
  },

  getModulesFromMapFunction() {
    const result = this.simpleMap(path => {
      const node = path.value;
      const params = node.params;
      if (!params || params.length === 0) {
        return [];
      }

      switch (params[0].type) {
        case 'Identifier':
          return j(node.body)
            .find(j.MemberExpression, {
              object: {
                type: 'Identifier',
                name: params[0].name,
              },
            })
            .simpleMap(path => {
              return utils.getMemberProperty(path.value);
            });
        case 'ObjectPattern':
          return params[0].properties.map(prop => prop.key.name);
        default:
          throw new Error(`getModulesFromMapFunction: unsupported param type ${params[0].type}`);
      }
    });
    return flatten(result);
  },

  getActionTypeFromCall() {
    const ret = this.simpleMap(path => {
      const node = path.node;
      assert(
        node.type === 'CallExpression',
        `getActionTypeFromCall: should be CallExpression`
      );
      assert(
        node.arguments.length === 1,
        `getActionType: dispatch should be called with 1 argument, but got ${node.arguments.length}`
      );
      const obj = node.arguments[0];

      // TODO: Support dispatch(routerRedux.push({''}));
      if (j.CallExpression.check(obj)) {
        console.warn(`[WARN] getActionTypeFromCall: don't support dispatch with CallExpression yet`);
        return null;
      }

      assert(
        obj.type === 'ObjectExpression',
        `getActionType: dispatch should be called with Object, but got ${node.type}`
      );
      const value = utils.getObjectProperty(obj, 'type');
      if (value.type === 'Literal') {
        return value.value;
      } else if (value.type === 'Identifier') {
        const result = j(path).getVariableDeclarators(_ => value.name);
        if (result.size()) {
          return result.get().value.init.value;
        } else {
          return UNRESOLVED_IDENTIFIER;
        }
      } else if (value.type === 'TemplateLiteral') {
        console.warn(`[WARN] getActionTypeFromCall: unsupported action type ${value.type}`);
      } else {
        throw new Error(`getActionTypeFromCall: unsupported action type ${value.type}`);
      }
    });
    return ret.filter(item => !!item);
  },

};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};
