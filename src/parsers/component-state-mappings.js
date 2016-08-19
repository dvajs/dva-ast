import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getStateMappingBoilerplate = () => ({
    filePath: '',
    node: null,
    source: null,
    modelIds: '',
    componentId: '',
  });

  const getMapStateToPropsFunction = (mapStateToProps, nodePath) => {
    let func;
    const { type } = mapStateToProps;
    if (['ArrowFunctionExpression', 'FunctionExpression'].indexOf(type) > -1) {
      func = mapStateToProps;
    } else if (type === 'Identifier') {
      const funcName = mapStateToProps.name;
      const resolvedScope = nodePath.scope.lookup(funcName);
      if (resolvedScope) {
        resolvedScope.getBindings()[funcName].every(
          _p => {
            const decl = j(_p).closest(j.VariableDeclarator);
            const node = decl.nodes()[0];

            // we didn't consider situations like:
            // connect(mapStateToProps)(...) => const mapStateToProps = m; => const m = () => {};
            if (node) {
              if (['ArrowFunctionExpression', 'FunctionExpression'].indexOf(type) > -1) {
                func = node.init;
              }
            } else {
              const funcDecl = j(_p).closest(j.FunctionDeclaration);
              const funcNode = funcDecl.nodes()[0];

              if (funcNode) {
                func = funcNode;
              }
            }

            return false;
          }
        );
      }
    }
    return func;
  };

  const findBodyObjectExpression = (body) => {
    let obj;
    if (body.type === 'ObjectExpression') obj = body;

    j(body).find(j.ReturnStatement)
      .forEach(p => {
        obj = p.node.argument;
      });
    return obj;
  };

  const parseStateSubscriptionProperty = (property, stateName) => {
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
  };

  const getModelsFromMapStateToPropsFunction = (func) => {
    if (!func || !func.params || !func.params.length) {
      return {};
    }

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

    const obj = findBodyObjectExpression(body);
    const data = obj.properties.reduce((val, property) => ({
      ...val,
      ...parseStateSubscriptionProperty(property, stateName, models),
    }), {});

    return data;
  };

  const parse = ({ filePath, nodePath, componentId }) => {
    const stateMapping = getStateMappingBoilerplate();
    stateMapping.node = nodePath.node;
    stateMapping.filePath = filePath;
    stateMapping.componentId = componentId;

    if (stateMapping.node.arguments[0]) {
      const funcNode = getMapStateToPropsFunction(
        stateMapping.node.arguments[0],
        nodePath
      );
      stateMapping.source = u.getSourceFromNode(funcNode);
      stateMapping.modelIds = Object.keys(getModelsFromMapStateToPropsFunction(funcNode));
    }

    return stateMapping;
  };

  return {
    parse,
  };
}
