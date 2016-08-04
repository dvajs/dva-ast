import recast from 'recast';
import XNode from '../base/XNode';

export default class ComponentConnect extends XNode {
  constructor({ jscodeshift, nodePath, component }) {
    super();
    this.j = jscodeshift;
    this.nodePath = nodePath;
    this.component = component;
    this.data = {
      mapStateToProps: null,
    };
    if (nodePath) {
      this.parse(nodePath.node);
    }
  }
  parse(node) {
    const mapStateToProps = node.arguments[0];
    if (mapStateToProps) {
      const func = this.findMapStateToPropsFunction(mapStateToProps);
      this.data.mapStateToProps = {
        data: this.analyzeMapStateToProps(func),
        func: recast.print(func).code,
      };
    }
  }
  findMapStateToPropsFunction(mapStateToProps) {
    const { type } = mapStateToProps;
    if (['ArrowFunctionExpression', 'FunctionExpression'].indexOf(type) > -1) {
      return mapStateToProps;
    } else if (type === 'Identifier') {
      const funcName = mapStateToProps.name;
      const resolvedScope = this.nodePath.scope.lookup(funcName);
      if (resolvedScope) {
        resolvedScope.getBindings()[funcName].every(
          _p => {
            const decl = this.j(_p).closest(this.j.VariableDeclarator);
            const node = decl.nodes()[0];

            // we didn't consider situations like:
            // connect(mapStateToProps)(...) => const mapStateToProps = m; => const m = () => {};
            if (node) {
              if (['ArrowFunctionExpression', 'FunctionExpression'].indexOf(type) > -1) {
                return node.init;
              }
            } else {
              const funcDecl = this.j(_p).closest(this.j.FunctionDeclaration);
              const funcNode = funcDecl.nodes()[0];

              if (funcNode) {
                return funcNode;
              }
            }
          }
        );
      }
    }
    return null;
  }
  analyzeMapStateToProps(func) {
    if (!func) return {};
    const param = func.params[0];
    const body = func.body;
    let stateName;
    let models;

    if (param.type === 'Identifier') {
      stateName = param.name;
    }

    if (param.type === 'ObjectPattern') {
      models = param.properties.map(prop => prop.value.name);
    }

    const obj = this.findBodyObjectExpression(body);
    const data = obj.properties.reduce((val, property) => ({
      ...val,
      ...this.parseStateSubscriptionProperty(property, stateName, models),
    }), {});

    return data;
  }
  findBodyObjectExpression(body) {
    let obj;
    if (body.type === 'ObjectExpression') obj = body;

    this.j(body).find(this.j.ReturnStatement)
      .forEach(p => {
        obj = p.node.argument;
      });
    return obj;
  }
  parseStateSubscriptionProperty(property, stateName) {
    let model;
    let data;

    // TODO: should consider situations: productList: state.products.list
    if (property.value.type === 'MemberExpression') {
      if (property.value.object.type === 'Identifier') {
        if (property.value.property.type === 'Identifier') {
          model = property.value.property.name;
          data = `${stateName}.${model}`;
        }
      }
    }

    if (!stateName) {
      if (property.value.type === 'Identifier') {
        model = property.value.name;
        data = `${model}`;
      }
    }

    return {
      [property.key.name]: {
        model,
        data,
      },
    };
  }
}
