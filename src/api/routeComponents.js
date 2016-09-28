import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { getExpression } from '../utils';
import { join } from 'path';
import assert from 'assert';
import j from 'jscodeshift';

export function create(payload) {
  assert(payload.componentName, 'api/routeComponents/create: payload should have componentName');
  const template = getTemplate('routeComponents.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  writeFile(filePath, source);
}

export function remove(payload) {
  const filePath = join(payload.sourcePath, payload.filePath);
  removeFile(filePath);
}

export function update(payload) {
  assert(payload.source, 'api/routeComponents/update: payload should have source');
  const filePath = join(payload.sourcePath, payload.filePath);
  writeFile(filePath, payload.source);
}

export function addDispatch(payload) {
  assert(payload.actionType, 'api/routeComponents/addDispatch: payload should have actionType');
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const methodName = `["${payload.actionType}"]`;

  root.findRouteComponents().forEach(path => {
    if (path.node.type === 'ClassDeclaration') {
      // add method
      const renderMethod = j(path).find(j.MethodDefinition, {
        key: {
          type: 'Identifier',
          name: 'render',
        },
      }).at(0);

      renderMethod.insertBefore(
        j.methodDefinition(
          'method',
          j.identifier(methodName),
          getExpression(`\nfunction() {\n  this.props.dispatch({ type: '${payload.actionType}', payload: {} });\n}`)
        )
      );

      // add button & callback to render
      let once = false;
      const jsxElements = j(path).find(j.JSXElement, (node) => {
        if (once) { return false; } // return false is used to prevent nest traverse
        once = true;
        return node;
      });

      const rootElement = jsxElements.at(0);
      rootElement.__paths[0].value.children.unshift(
        getExpression(`\r\n<button onClick={() => { this${methodName}; }}>click to dispatch ${payload.actionType}</button>\n`)
      );
    }
  });

  writeFile(filePath, root.toSource());
}
