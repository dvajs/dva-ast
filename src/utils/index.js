import j from 'jscodeshift';
import assert from 'assert';

export function getExpression(source, opts = {}) {
  const { noParenthesis } = opts;
  const program = j(noParenthesis ? source : `(${source})`).find(j.Program).get();
  const node = program.node.body[0];
  return node.expression;
}

export function getObjectProperty(node, key) {
  assert(
    node.type === 'ObjectExpression',
    `(utils)getObjectProperty: node is not an Object`
  );
  for (let prop of node.properties) {
    if (prop.key.name === key) {
      return prop.value;
    }
  }
  return null;
}

export function getMemberProperty(node) {
  return getPropertyValue(node.property);
}

export function getPropertyValue(node) {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Identifier':
      return node.name;
    default:
      throw new Error('(utils)getPropertyValue: unsupported property type');
  }
}

export function recursiveParse(node) {
  if (node.type === 'ObjectExpression') {
    return node.properties.reduce((obj, property) => ({
      ...obj,
      ...recursiveParse(property),
    }), {});
  }
  if (node.type === 'Property') {
    let propsName;
    if (node.key.type === 'Identifier') {
      propsName = node.key.name;
    }
    if (node.key.type === 'Literal') {
      propsName = node.key.value;
    }
    return {
      [propsName]: recursiveParse(node.value),
    };
  }
  if (node.type === 'Literal') {
    return node.value;
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.map(recursiveParse);
  }
  if (node.type === 'FunctionExpression') {
    return node;
  }
  return null;
}

