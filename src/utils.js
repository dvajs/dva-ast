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

export const parseConnect = (args) => {
  // mapStateToProps
  const mstp = args[0];
  console.log(mstp);
  if (mstp.type === 'ArrowFunctionExpression') {
    if (mstp.params.length > 0 && mstp.params[0].type === 'ObjectPattern') {
      // todo: { products }
    }

    // todo: state
    if (mstp.params.length > 0 && mstp.params[0].type === 'Identifier') {
      // todo: find definedScope
    }
  }

  if (mstp.type === 'Identifier') {
    const stateName = mstp.name;

    // todo: find definedScope
  }
  return {};
};

export const parseContainer = (p) => {
  return {
    connect: parseConnect(p.node.arguments),
  };
};
