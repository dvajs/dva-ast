import j from 'jscodeshift';
import once from 'lodash.once';

const methods = {

  simpleMap(callback) {
    const result = [];
    this.forEach(function(path) {
      result.push(callback.apply(path, arguments));
    });
    return result;
  },

  hasModule(module) {
    return (
      this
        .find(j.ImportDeclaration, node => {
          return node.source.value === module;
        })
        .size() > 0
    ) || (
      this
        .findVariableDeclarators()
        .filter(j.filters.VariableDeclarator.requiresModule(module))
        .size() > 0
    );
  },

  hasReactModule() {
    return this.hasModule('react') ||
        this.hasModule('react-native') ||
        this.hasModule('react/addon');
  },

  // Not used yet
  getDeclarators: function(nameGetter) {
    return this.map(function(path) {
      /*jshint curly:false*/
      var scope = path.scope;
      if (!scope) return;
      var name = nameGetter.apply(path, arguments);
      if (!name) return;
      scope = scope.lookup(name);
      if (!scope) return;
      var bindings = scope.getBindings()[name];
      if (!bindings) return;
      var decl = Collection.fromPaths(bindings)
        .closest(types.VariableDeclarator);
      if (decl.length === 1) {
        return decl.paths()[0];
      }
    }, types.VariableDeclarator);
  },

};

function register(jscodeshift = j) {
  jscodeshift.registerMethods(methods);
}

export default {
  register: once(register),
};

