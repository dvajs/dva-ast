export const parse = (p) => {
  if (p.type === 'Property') {
    let propsName;
    if (p.key.type === 'Identifier') {
      propsName = p.key.name;
    }
    if (p.key.type === 'Literal') {
      propsName = p.key.value;
    }
    return {
      [propsName]: parse(p.value),
    };
  }
  if (p.type === 'ObjectExpression') {
    return p.properties.reduce((obj, property) => (
      {
        ...obj,
        ...parse(property),
      }
    ), {});
  }

  if (p.type === 'Literal') {
    return p.value;
  }

  if (p.type === 'ArrayExpression') {
    return p.elements.map(parse);
  }

  if (p.type === 'FunctionExpression') {
    return p;
  }

  return null;
};

export const parseModel = parse;

const isFunctionType = (type) =>
  ['ArrowFunctionExpression', 'FunctionExpression'].indexOf(type) > -1;

const findMapStateToPropsFunction = (connectFirstArgument = {}, p, j) => {
  let func;
  const { type } = connectFirstArgument;
  if (isFunctionType(type)) func = connectFirstArgument;

  // need to find decl
  if (type === 'Identifier') {
    const funcName = connectFirstArgument.name;
    const resolvedScope = p.scope.lookup(funcName);
    if (resolvedScope) {
      resolvedScope.getBindings()[funcName].every(
        _p => {
          const decl = j(_p).closest(j.VariableDeclarator);
          const node = decl.nodes()[0];

          // we didn't consider situations like:
          // connect(mapStateToProps)(...) => const mapStateToProps = m; => const m = () => {};
          if (isFunctionType(node.init.type)) {
            func = node.init;
          }
          return _p;
        }
      );
    }
  }

  return func;
};

const findBodyObjectExpression = (body, j) => {
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

const analyzeMapStateToProps = (func, j) => {
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

  const obj = findBodyObjectExpression(body, j);
  const data = obj.properties.reduce((val, property) => ({
    ...val,
    ...parseStateSubscriptionProperty(property, stateName, models),
  }), {});

  return data;
};

export const parseConnect = (args, p, j) => {
  const mapStateToPropsFunc = findMapStateToPropsFunction(args[0], p, j);
  const mapStateToPropsData = analyzeMapStateToProps(mapStateToPropsFunc, j);
  return mapStateToPropsData;
};

export const parseComponent = (args, parent) => {
  let componentName;
  if (isFunctionType(args[0].type)) {
    componentName = parent.parent.value.id.name;
  } else if (args[0].type === 'Identifier') {
    componentName = args[0].name;
  }
  return {
    componentName,
  };
};

export const parseContainer = (p, j) => ({
  connect: parseConnect(p.node.arguments, p, j),
  component: parseComponent(p.parent.node.arguments, p.parent, j),
});
