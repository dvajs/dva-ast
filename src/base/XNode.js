export default class XNode {

  // get ObjectExpression property name
  getPropertyKeyName(key) {
    let keyName;
    if (key.type === 'Identifier') {
      keyName = key.name;
    }
    if (key.type === 'Literal') {
      keyName = key.value;
    }
    return keyName;
  }

  // parse literal
  recursiveParse = (node) => {
    if (node.type === 'ObjectExpression') {
      return node.properties.reduce((obj, property) => ({
        ...obj,
        ...this.recursiveParse(property),
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
        [propsName]: this.recursiveParse(node.value),
      };
    }

    if (node.type === 'Literal') {
      return node.value;
    }

    if (node.type === 'ArrayExpression') {
      return node.elements.map(this.recursiveParse);
    }

    if (node.type === 'FunctionExpression') {
      return node;
    }

    return null;
  }

  // save to source file
  save() {
    this.j.toSource();
  }
}
