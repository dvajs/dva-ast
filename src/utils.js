export const getValue = (p) => {
  if (p.type === 'Property') {
    return {
      [p.key.name]: getValue(p.value),
    };
  }
  if (p.type === 'ObjectExpression') {
    return p.properties.reduce((obj, property) => (
      {
        ...obj,
        ...getValue(property),
      }
    ), {});
  }

  if (p.type === 'Literal') {
    return p.value;
  }

  if (p.type === 'ArrayExpression') {
    return p.elements.map(getValue);
  }

  return null;
};

export const parseState = (p) => getValue(p);
