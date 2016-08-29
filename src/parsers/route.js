import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getRouteBoilerplate = () => ({
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
  });

  const parse = ({ filePath, nodePath }) => {
    const route = getRouteBoilerplate();
    route.filePath = filePath;
    route.node = nodePath.__paths[0].node;
    route.source = u.getSourceFromNode(route.node);
    return route;
  };

  return {
    parse,
  };
}
