import infrastructureUtils from '../utils/InfrastructureUtils';

export default function (j) {
  const u = infrastructureUtils(j);

  const getReducerBoilerplate = () => ({
    id: '',                 // `${modelId}_reducer_${actionType}`
    node: null,             // ast node
    source: null,           // source code
    filePath: '',
    modelId: '',
    actionType: '',
  });

  const parse = ({ filePath, node, modelId, actionType }) => {
    if (node.type !== 'FunctionExpression') {
      console.error('unsupported type of dva model reducers');
      return null;
    }

    const reducer = getReducerBoilerplate();
    reducer.filePath = filePath;
    reducer.node = node;
    reducer.source = u.getSourceFromNode(reducer.node);
    reducer.modelId = modelId;
    reducer.actionType = actionType;
    reducer.id = `${modelId}_reducer_${actionType}`;
    return reducer;
  };

  return {
    parse,
  };
}
