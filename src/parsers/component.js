import infrastructureUtils from '../utils/InfrastructureUtils';
import stateMappingParserFactory from './component-state-mappings';

export default function (j) {
  const u = infrastructureUtils(j);
  const stateMappingParser = stateMappingParserFactory(j);

  const getComponentBoilerplate = () => ({
    id: '',                 // filePath + componentName
    filePath: '',
    componentName: '',
    node: null,             // ast node
    source: null,           // source code
    stateMappings: [],      // stateMapping objects
    dispatchMappings: [],   // TODO: mapDispatchToProps
    dispatches: [],
  });

  const getComponentName = (node) => {
    let componentName = '';
    if (node.type === 'VariableDeclarator') {
      componentName = node.id.name;
    } else if (node.type === 'ClassDeclaration') {
      componentName = node.id.name;
    } else if (node.type === 'FunctionDeclaration') {
      componentName = node.id.name;
    } else {
      // TODO, should consider anonymous component
      componentName = 'unknown';
    }

    return componentName;
  };

  const getConnects = (root) => {
    const connects = root.find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'connect', // TODO: should consider alias
      },
    });
    if (connects.size() > 1) {
      console.error('There\'s muiltple connects in this file !');
    }
    return connects;
  };

  const getDispatches = (root) => {
    const dispatchMap = {};
    root.find(j.Identifier, { name: 'dispatch' })
      .forEach(p => {
        const parentNode = p.parent.node;
        let actionObject = null;
        if (parentNode.type === 'CallExpression') {
          actionObject = parentNode.arguments[0];
        } else if (parentNode.type === 'MemberExpression') {
          const callNode = u.findClosestCallExpression(p.parent);
          actionObject = callNode && callNode.arguments ? callNode.arguments[0] : null;
        }
        if (actionObject) {
          u.analyzeAction(actionObject, (actionType) => {
            dispatchMap[actionType] = true;
          });
        }
      });

    return dispatchMap;
  };

  const parse = ({ filePath, nodePath, root }) => {
    const component = getComponentBoilerplate();
    component.node = nodePath.node;
    component.source = u.getSourceFromNode(component.node);
    component.filePath = filePath;
    component.componentName = getComponentName(component.node);
    component.id = `${component.filePath}_${component.componentName}`;

    const dispatchMap = getDispatches(root);
    component.dispatches = Object.keys(dispatchMap);

    const connects = getConnects(root);
    if (connects.size() > 0) {
      component.stateMappings = stateMappingParser.parse({
        filePath,
        nodePath: connects.get(0),
        componentId: component.id,
      });
    }

    return component;
  };

  return {
    parse,
  };
}
