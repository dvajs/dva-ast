export const getValue = (p) => {
  if (p.value.type === 'ObjectExpression') {
    return p.value.properties.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.key.name]: getValue(curr),
      }
    }, {})
  }

  if (p.value.type === 'Literal') {
    return p.value.value;
  }

  if (p.value.type === 'ArrayExpression') {
    // return p.value.elements.map(getValue);
  }
}

export const parseState = (p) => {
  console.log(getValue(p));
  return p;
};
