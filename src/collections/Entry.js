import j from 'jscodeshift';
import once from 'lodash.once';
import Collection from 'jscodeshift/src/Collection';

function getImportRequirePath(identifierName, path) {
  const scope = path.scope.lookup(identifierName);
  if (scope) {
    const importPath = scope.getBindings()[identifierName][0].parent.parent;
    const importNode = importPath.value;
    if (j.ImportDeclaration.check(importNode)) {
      return importNode.source.value;
    }
  }
}

function isDvaInstance(identifierName, path) {
  const scope = path.scope.lookup(identifierName);
  if (scope) {
    const declaratorPath = scope.getBindings()[identifierName][0].parent;
    const declaratorNode = declaratorPath.value;
    if (j.VariableDeclarator.check(declaratorNode)) {
      const { init } = declaratorNode;
      if (j.CallExpression.check(init) && j.Identifier.check(init.callee)) {
        return getImportRequirePath(init.callee.name, path) === 'dva';
      }
    }
  }
}

const methods = {

  findModelInjectPoints() {
    const pathes = [];
    this.find(j.CallExpression).forEach(path => {
      const node = path.value;
      if (j.MemberExpression.check(node.callee)) {
        const { object, property } = node.callee;
        if (['model', 'router'].indexOf(property.name) > -1 && isDvaInstance(object.name, path)) {
          pathes.push(path);
        }
      }
    });
    return Collection.fromPaths(pathes, this);
  },

  addModel(modelPath) {
    const points = this.findModelInjectPoints();
    if (points.size() === 0) return;

    points.forEach(path => {
      const node = path.value;
      const r = node.arguments[0];
      if (j.CallExpression.check(r) &&
        j.Identifier.check(r.callee) &&
        r.callee.name === 'require' &&
        r.arguments && r.arguments.length === 1 &&
        j.Literal.check(r.arguments[0]) &&
        r.arguments[0].value === modelPath
      ) {
        throw new Error(`addModel: model ${modelPath} exists`);
      }
    });

    const { object, property } = points.get().value.callee;
    const insertMethod = property.name === 'model' ?
      'insertAfter' :
      'insertBefore';

    const collection = points
      // get parent statement
      .map(path => path.parent)
      .at(0);

    collection[insertMethod].call(
      collection,
      j.expressionStatement(
        j.callExpression(
          j.memberExpression(object, j.identifier('model')),
          [
            j.callExpression(j.identifier('require'), [
              j.literal(modelPath)
            ])
          ]
        )
      )
    );
  },

};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};

