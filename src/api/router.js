import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { existsSync } from 'fs';
import { getExpression } from '../utils/index';
import { join, relative, sep } from 'path';
import assert from 'assert';
import j from 'jscodeshift';

// TODO: check react-router version
// assume that router.js is already created
function findRouterNode(root) {
  return root.find(
    j.JSXElement, {
      openingElement: {
        name: {
          name: 'Router'
        }
      }
    }
  ).nodes()[0];
}

// TODO: id 规则需要跟 collection 中复用
function findParentRoute(root, id) {
  if (!id) return findRouterNode(root);
  function find(node, parentPath = '', parentId) {
    const type = node.openingElement.name.name;
    const attributes = node.openingElement.attributes;
    let path;
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name.name === 'path') {
        path = attributes[i].value.value;
      }
    }

    let absolutePath;
    if (path) {
      absolutePath = path.charAt(0) === '/' ? path : `${parentPath}/${path}`;
    }

    let currentId;
    if (absolutePath) {
      currentId = `${type}-${absolutePath}`;
    } else if (parentId) {
      currentId = `${type}-parentId_${parentId}`;
    } else {
      currentId = `${type}-root`;
    }

    // found!
    if (currentId === id) return node;

    let found;
    if (node.children) {
      const childElements = node.children.filter(node => node.type === 'JSXElement');
      for (let i = 0; i < childElements.length; i++) {
        found = find(childElements[i], path, currentId);
        if (found) break;
      }
    }
    return found;
  }

  return find(findRouterNode(root), id);
}

function createElement(root, el, attributes = [], parentId) {
  const parentRoute = findParentRoute(root, parentId);
  if (!parentRoute) {
    throw new Error('createRoute, no element find by parentId');
  }
  parentRoute.children.push(
    j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(el),
        attributes.map(attr => {
          if (attr.isExpression) {
            return j.jsxAttribute(
              j.jsxIdentifier(attr.key),
              j.jsxExpressionContainer(
                j.identifier(attr.value)
              )
            )
          } else {
            return j.jsxAttribute(
              j.jsxIdentifier(attr.key),
              j.literal(attr.value)
            );
          }
        }),
        true
      ),
      null,
      [],
    )
  );
  parentRoute.children.push(j.jsxText('\n'));
}

export function createRoute(payload) {
  const { path, component = {}, parentId } = payload;
  assert(
    path && component.componentName,
    'api/router/createRoute: payload should at least have path or compnent'
  );

  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const parentRoute = findParentRoute(root);

  // append Route
  // TODO: support additonal attributes like components
  const attributes = [];
  if (path) {
    attributes.push({ key: 'path', value: path });
  }
  if (component.componentName) {
    attributes.push({ key: 'component', value: component.componentName, isExpression: true });
  }
  createElement(root, 'Route', attributes, parentId);

  if (!component.componentName) return writeFile(filePath, root.toSource());
  assert(
    component.filePath,
    'api/router/create: payload.component should have filePath'
  );

  // create & import component
  let relativePath;
  const componentFilePath = join(payload.sourcePath, component.filePath);
  if (existsSync(componentFilePath)) {
    relativePath = relative(filePath, componentFilePath);
    relativePath = relativePath.split(sep).join('/');  // workaround for windows
  }

  const imports = root.find(j.ImportDeclaration);
  const lastImport = imports.at(imports.size() - 1);
  lastImport.insertAfter(
    j.importDeclaration(
      [j.importDefaultSpecifier(
        j.identifier(component.componentName)
      )],
      j.literal(relativePath)
    )
  );
  writeFile(filePath, root.toSource());
}

export function createIndexRoute() {

}

export function createRedirect(payload) {
  assert(
    payload.from && payload.to,
    'api/router/createRedirect: payload should have from or to'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);

  createElement(
    root,
    'Redirect',
    [
      { key: 'from', value: payload.from },
      { key: 'to', value: payload.to },
    ],
    payload.parentId
  );

  writeFile(filePath, root.toSource());
}

export function createIndexRedirect(payload) {
  assert(
    payload.to,
    'api/router/createIndexRedirect: payload should have to'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);

  createElement(
    root,
    'IndexRedirect',
    [
      { key: 'to', value: payload.to },
    ],
    payload.parentId
  );

  writeFile(filePath, root.toSource());
}
