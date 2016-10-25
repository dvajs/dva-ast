import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { getExpression } from '../utils/index';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import assert from 'assert';
import j from 'jscodeshift';

export function create(payload) {
  assert(payload.componentName, 'api/routeComponents/create: payload should have componentName');
  const template = getTemplate('routeComponents.create');
  const source = template(payload);
  const filePath = join(payload.sourcePath, payload.filePath);
  assert(!existsSync(filePath), 'api/routeComponents/create: file exists');
  writeFile(filePath, source);

  if (payload.css) {
    let cssFilePath = filePath;
    const en = extname(filePath);
    if (en) {
      cssFilePath = filePath.slice(0, filePath.lastIndexOf(en));
    }
    cssFilePath = cssFilePath + '.css';
    writeFile(cssFilePath, `\r\n.normal {\r\n}\r\n`);
  }
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

function addDispatchButton(path, dispatchAction, callback) {
  let once = false;
  const jsxElements = j(path).find(j.JSXElement, (node) => {
    if (once) { return false; } // return false is used to prevent nest traverse
    once = true;
    return node;
  });

  const rootElement = jsxElements.at(0);
  rootElement.__paths[0].value.children.unshift(
    getExpression(`\r\n<button onClick={() => { ${callback}; }}>click to dispatch ${dispatchAction}</button>\n`)
  );
}

export function addDispatch(payload) {
  assert(payload.actionType, 'api/routeComponents/addDispatch: payload should have actionType');
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);

  root.findRouteComponents().forEach(path => {
    if (path.node.type === 'ClassDeclaration') {
      // add method
      const methodName = `["${payload.actionType}"]`;
      const callMethod = `this${methodName}()`;
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
      addDispatchButton(path, payload.actionType, callMethod);
    } else if(path.node.type === 'FunctionDeclaration') {
      const callFunction = `props.dispatch({ type: '${payload.actionType}', payload: {} })`;
      addDispatchButton(path, payload.actionType, callFunction);
    }

  });

  writeFile(filePath, root.toSource());
}
