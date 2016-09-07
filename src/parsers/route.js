import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getRouteBoilerplate = () => ({
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
    tree: null,
  });

  const reactRouterComps = ['Router', 'Route', 'Redirect', 'IndexRedirect', 'IndexRoute'];

  const getAttrValue = (val) => {
    let returnVal = '';
    if (val.type === 'Literal') returnVal = val.value;
    if (val.type === 'JSXExpressionContainer' && val.expression.type === 'Identifier') {
      returnVal = val.expression.name;
    }
    return returnVal;
  };

  const getRouteTree = (node, parentPath, parentId) => {
    if (node.type === 'Literal' || node.type === 'JSXExpressionContainer') return null;
    if (node.type === 'JSXElement' &&
        node.openingElement &&
        node.openingElement.name &&
        node.openingElement.name.type === 'JSXIdentifier' &&
        (reactRouterComps.indexOf(node.openingElement.name.name) > -1)) {
      const currentRoute = {
        type: node.openingElement.name.name,
        children: [],
      };
      const attrs = node.openingElement.attributes || [];
      attrs.forEach(attr => {
        if (attr.type === 'JSXAttribute') {
          if (attr.name.type === 'JSXIdentifier') {
            currentRoute[attr.name.name] = getAttrValue(attr.value);
          }
        }
      });

      if (currentRoute.path) {
        currentRoute.absolutePath = currentRoute.path.charAt(0) === '/' ?
          currentRoute.path :
          `${parentPath}/${currentRoute.path}`;
      }

      if (currentRoute.absolutePath) {
        currentRoute.id = `${currentRoute.type}-${currentRoute.absolutePath}`;
      } else if (!parentId) {
        currentRoute.id = `${currentRoute.type}-root`;
      } else {
        currentRoute.id = `${currentRoute.type}-parentId_${parentId}`;
      }

      (node.children || []).forEach(child => {
        const childRoute = getRouteTree(child, currentRoute.path || '', currentRoute.id);
        if (childRoute) currentRoute.children.push(childRoute);
      });

      return currentRoute;
    }
    throw new Error(`routes parsing error: unsupported jsx elements ${node.type}`);
  };

  const parse = ({ filePath, nodePath }) => {
    const route = getRouteBoilerplate();
    route.filePath = filePath;
    route.node = nodePath.__paths[0].node;
    route.source = u.getSourceFromNode(route.node);
    try {
      route.tree = getRouteTree(route.node);
    } catch (e) {
      console.error(e);
    }
    return route;
  };

  return {
    parse,
  };
}
