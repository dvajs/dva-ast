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

export const parseConnect = (args, p, j) => {
  // mapStateToProps
  const mstp = args[0];
  if (mstp.type === 'ArrowFunctionExpression') {
    if (mstp.params.length > 0 && mstp.params[0].type === 'ObjectPattern') {
      // todo: { products }
    }

    // todo: state
    if (mstp.params.length > 0 && mstp.params[0].type === 'Identifier') {
      // analyze mapStateToProps function
    }
  }

  if (mstp.type === 'Identifier') {
    const stateName = mstp.name;
    const resolvedScope = p.scope.lookup(stateName);
    if (resolvedScope) {
      resolvedScope.getBindings()[stateName].every(
        p => {
          const decl = j(p).closest(j.VariableDeclarator);
          const node = decl.nodes()[0];

          // TODO or FunctionExpression
          if (node.init.type === 'ArrowFunctionExpression') {
            // analyze mapStateToProps function
          }
        }
      )
    }
  }
  return {};
};

export const parseContainer = (p, j) => {
  return {
    connect: parseConnect(p.node.arguments, p, j),
  };
};
